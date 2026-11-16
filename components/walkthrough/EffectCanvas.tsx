"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import type { Clip } from "@/lib/walkthrough/data";
import type { FrameState, Source } from "@/lib/walkthrough/timeline";
import { fragmentShader, vertexShader } from "./shaders";

/** sRGB 0..1, passed raw (see shaders.ts on colour handling). */
const RAW = {
  ink: new THREE.Vector3(0x1f / 255, 0x1e / 255, 0x1c / 255),
  paper: new THREE.Vector3(0xf6 / 255, 0xf3 / 255, 0xee / 255),
};

const GRAIN = 0.03;
const VIGNETTE = 0.12;
/** Maximum unsharp amount, reached when footage is enlarged 1.67x or more. */
const SHARPEN = 0.9;

type Props = {
  videos: (HTMLVideoElement | null)[];
  clips: Clip[];
  frameRef: RefObject<FrameState | null>;
  /**
   * Clips whose first frame has decoded. Deliberately NOT video.readyState:
   * that drops below HAVE_CURRENT_DATA during every seek, and treating it as
   * "not ready" painted charcoal frames while scrolling. The texture simply
   * keeps the last decoded frame until the seek lands.
   */
  loadedRef: RefObject<boolean[]>;
  /** Render only while the walkthrough is on screen. */
  active: boolean;
  onFail: () => void;
};

function Scene({ videos, clips, frameRef, loadedRef }: Omit<Props, "active" | "onFail">) {
  const size = useThree((s) => s.size);

  const textures = useMemo(
    () =>
      videos.map((v) => {
        if (!v) return null;
        const t = new THREE.VideoTexture(v);
        t.colorSpace = THREE.NoColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        return t;
      }),
    [videos],
  );

  // requestVideoFrameCallback does not always fire for seeks on a paused
  // video, so flag the texture on every seek as well.
  useEffect(() => {
    const offs = videos.map((v, i) => {
      if (!v) return undefined;
      const flag = () => {
        const t = textures[i];
        if (t) t.needsUpdate = true;
      };
      v.addEventListener("seeked", flag);
      v.addEventListener("loadeddata", flag);
      return () => {
        v.removeEventListener("seeked", flag);
        v.removeEventListener("loadeddata", flag);
      };
    });
    return () => {
      offs.forEach((off) => off?.());
      textures.forEach((t) => t?.dispose());
    };
  }, [videos, textures]);

  const blank = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    t.needsUpdate = true;
    return t;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTexA: { value: blank as THREE.Texture },
      uTexB: { value: blank as THREE.Texture },
      uIsColorA: { value: 1 },
      uIsColorB: { value: 1 },
      uColorA: { value: RAW.ink.clone() },
      uColorB: { value: RAW.ink.clone() },
      uSizeA: { value: new THREE.Vector2(16, 9) },
      uSizeB: { value: new THREE.Vector2(16, 9) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMix: { value: 0 },
      uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      uRadial: { value: 0 },
      uTime: { value: 0 },
      uGrain: { value: GRAIN },
      uVignette: { value: VIGNETTE },
      uDimA: { value: 0 },
      uSharpen: { value: 0 },
      uInk: { value: RAW.ink.clone() },
    }),
    [blank],
  );

  // Uniforms are written through the mesh ref every frame (R3F owns the material).
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const f = frameRef.current;
    const mat = meshRef.current?.material as THREE.ShaderMaterial | undefined;
    if (!f || !mat) return;
    const u = mat.uniforms;

    const bind = (src: Source, key: "A" | "B") => {
      const video = src.kind === "clip" ? videos[src.clip] : null;
      const tex = src.kind === "clip" ? textures[src.clip] : null;
      if (src.kind === "clip" && video && tex && loadedRef.current[src.clip]) {
        u[`uIsColor${key}`].value = 0;
        u[`uTex${key}`].value = tex;
        (u[`uSize${key}`].value as THREE.Vector2).set(video.videoWidth || 16, video.videoHeight || 9);
      } else {
        // Not loaded yet: hold on charcoal; the still layer above covers it.
        u[`uIsColor${key}`].value = 1;
        u[`uTex${key}`].value = blank;
        (u[`uColor${key}`].value as THREE.Vector3).copy(src.kind === "color" ? RAW[src.color] : RAW.ink);
      }
    };
    bind(f.a, "A");
    bind(f.b, "B");

    (u.uRes.value as THREE.Vector2).set(size.width, size.height);

    // Sharpen in proportion to how much the footage is being enlarged on this
    // screen (device pixels per video pixel under object-fit: cover).
    const ref = clips[f.focusClip];
    const dpr = state.viewport.dpr;
    const enlarge = Math.max((size.width * dpr) / ref.width, (size.height * dpr) / ref.height);
    u.uSharpen.value = Math.min(Math.max((enlarge - 1) * 1.5, 0), 1) * SHARPEN;

    u.uMix.value = f.mix;
    u.uDimA.value = f.dim;
    u.uTime.value = state.clock.elapsedTime;

    if (f.focus) {
      // Frame coordinates (top-left origin) -> screen uv under object-fit: cover.
      const clip = clips[f.focusClip];
      const rs = size.width / size.height;
      const rt = clip.width / clip.height;
      const sx = rs > rt ? 1 : rs / rt;
      const sy = rs > rt ? rt / rs : 1;
      (u.uFocus.value as THREE.Vector2).set((f.focus.x - 0.5) / sx + 0.5, (1 - f.focus.y - 0.5) / sy + 0.5);
      u.uRadial.value = 1;
    } else {
      u.uRadial.value = 0;
    }

    // Effects fade out with the outro so the last frame is exactly paper.
    const keep = f.phase === "outro" ? 1 - f.mix : 1;
    u.uGrain.value = GRAIN * keep;
    u.uVignette.value = VIGNETTE * keep;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

class CanvasBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function EffectCanvas({ active, onFail, ...scene }: Props) {
  return (
    <CanvasBoundary onFail={onFail}>
      <Canvas
        linear
        flat
        // Render at the screen's real pixel density (capped at 2). At 1x on a
        // HiDPI display the browser enlarges the canvas a second time, which
        // blurs the footage; the shader is cheap enough to afford this.
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            onFail();
          });
        }}
        style={{ position: "absolute", inset: 0 }}
        aria-hidden
      >
        <Scene {...scene} />
      </Canvas>
    </CanvasBoundary>
  );
}
