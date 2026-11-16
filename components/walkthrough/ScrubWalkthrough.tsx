"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavHero } from "@/components/layout/NavHero";
import { useLenis } from "@/components/providers/LenisProvider";
import { cn } from "@/lib/cn";
import { ensureGsap, gsap, ScrollTrigger } from "@/lib/gsap";
import type { Clip } from "@/lib/walkthrough/data";
import { attachSource, loadClipBlob, VideoScrubber } from "@/lib/walkthrough/scrubber";
import { buildTimeline, COMPACT_UNITS, UNITS, type FrameState } from "@/lib/walkthrough/timeline";
import { IntroBackdrop } from "./IntroBackdrop";
import { IntroTitle, type TitleSize } from "./IntroTitle";
import { RoomIndex } from "./RoomIndex";
import { RoomOverlay } from "./RoomOverlay";

const EffectCanvas = dynamic(() => import("./EffectCanvas"), { ssr: false });

type Props = {
  clips: Clip[];
  effects: "webgl" | "css";
  variant: "desktop" | "mobile";
  title: string;
  eyebrow?: string;
  sentence: string;
  titleSize?: TitleSize;
  compact?: boolean;
  /** Unrecoverable problem (load error, stalled seeks): switch to stills. */
  onFail: (reason: string) => void;
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const LOAD_TIMEOUT_MS = 30000;

/**
 * Pinned, scroll-scrubbed walkthrough. The track is tall; the stage inside is
 * `position: sticky` (pinning without GSAP's pin-spacer moving React nodes).
 * A GSAP ticker loop turns scroll progress into seeks, shader uniforms and
 * direct style writes; React only re-renders when the active room changes.
 */
export function ScrubWalkthrough({ clips, effects: initialEffects, variant, title, eyebrow, sentence, titleSize, compact = false, onFail }: Props) {
  const timeline = useMemo(() => buildTimeline(clips, compact ? COMPACT_UNITS : UNITS), [clips, compact]);
  const lenis = useLenis();

  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const inkRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const stillNodes = useRef(new Map<string, HTMLImageElement>());
  const frameRef = useRef<FrameState | null>(null);
  /** Per clip: first frame decoded. Shared with the canvas (see EffectCanvas). */
  const loadedRef = useRef<boolean[]>([]);
  const onFailRef = useRef(onFail);
  useEffect(() => {
    onFailRef.current = onFail;
  });

  const [videos, setVideos] = useState<(HTMLVideoElement | null)[]>(() => clips.map(() => null));
  const [effects, setEffects] = useState(initialEffects);
  const [loadPct, setLoadPct] = useState(0);
  const [firstReady, setFirstReady] = useState(false);
  const [view, setView] = useState<{ key: string | null; chrome: boolean }>({ key: null, chrome: false });
  const [onScreen, setOnScreen] = useState(true);

  const videoRefs = useMemo(
    () =>
      clips.map((_, i) => (el: HTMLVideoElement | null) => {
        setVideos((prev) => (prev[i] === el ? prev : prev.map((v, j) => (j === i ? el : v))));
      }),
    [clips],
  );

  // Engine: loading, scrubbing, per-frame DOM updates.
  useEffect(() => {
    if (videos.some((v) => !v)) return;
    const els = videos as HTMLVideoElement[];
    const track = trackRef.current;
    if (!track) return;
    ensureGsap();

    const ac = new AbortController();
    const ready = clips.map(() => false);
    loadedRef.current = ready;
    const blobUrls: string[] = [];
    let failed = false;
    const fail = (reason: string) => {
      if (failed) return;
      failed = true;
      onFailRef.current(reason);
    };

    const scrubbers = els.map(
      (v, i) =>
        new VideoScrubber(
          v,
          clips[i].fps,
          Math.round(clips[i].duration * clips[i].fps),
          () => {},
          () => fail("seek-stall"),
        ),
    );

    const requested = new Set<number>();
    const load = (i: number) => {
      if (i >= clips.length || requested.has(i)) return;
      requested.add(i);
      loadClipBlob(clips[i].video[variant], (f) => i === 0 && setLoadPct(Math.round(f * 100)), ac.signal)
        .then((url) => {
          blobUrls.push(url);
          return attachSource(els[i], url);
        })
        .then(() => {
          ready[i] = true;
          scrubbers[i].setReady();
          if (i === 0) setFirstReady(true);
        })
        .catch(() => {
          if (!ac.signal.aborted) fail("load-error");
        });
    };
    load(0);
    const loadTimer = setTimeout(() => {
      if (!ready[0]) fail("load-timeout");
    }, LOAD_TIMEOUT_MS);

    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        // Small smoothing only. Higher values (0.6 was tried) make the footage
        // trail behind the scroll and feel wrong when the direction reverses.
        // Touch-only devices get a little more: Lenis does not smooth touch
        // scrolling, so this is the only smoothing there, and touch/fling
        // scroll events arrive unevenly.
        scrub: ScrollTrigger.isTouch === 1 ? 0.5 : 0.3,
        invalidateOnRefresh: true,
      },
    });

    const stills = [...stillNodes.current.entries()];
    let lastKey: string | null | undefined;
    let lastChrome: boolean | undefined;

    // Skip style writes that would not change anything (avoids needless style work every frame).
    const written = new WeakMap<HTMLElement, Record<string, string>>();
    const set = (el: HTMLElement | null, prop: "opacity" | "transform", value: string) => {
      if (!el) return;
      const cache = written.get(el) ?? {};
      if (cache[prop] === value) return;
      cache[prop] = value;
      written.set(el, cache);
      el.style[prop] = value;
    };
    const op = (v: number) => (Math.round(v * 1000) / 1000).toString();

    let lastP = -1;
    let restTicks = 0;

    const tick = () => {
      const s = timeline.stateAt(proxy.p);
      frameRef.current = s;

      // Once the scroll has settled (~0.1s without change), land on an original
      // frame rather than an interpolated one.
      restTicks = Math.abs(proxy.p - lastP) > 1e-6 ? 0 : restTicks + 1;
      lastP = proxy.p;
      const atRest = restTicks >= 6;

      s.times.forEach((t, i) => {
        if (t !== null) scrubbers[i].request(t, atRest ? clips[i].originalEvery : 1);
      });
      scrubbers.forEach((sc) => sc.pump());

      // Preload the next clip halfway through the current one.
      timeline.clipSegs.forEach((seg, i) => {
        if (proxy.p >= seg.start + (seg.end - seg.start) * 0.5) load(i + 1);
      });

      // Opening title clears before the door opens.
      const tp = s.phase === "intro" ? s.introProgress : 1;
      set(titleRef.current, "opacity", op(1 - clamp01(tp / 0.45)));
      set(titleRef.current, "transform", `translate3d(0, ${(-tp * 6).toFixed(2)}vh, 0)`);
      set(fillRef.current, "transform", `scaleY(${s.videoProgress.toFixed(4)})`);

      // Poster (frame 0 + veil) until the first clip can draw; then the canvas/video takes over.
      set(posterRef.current, "opacity", ready[0] ? "0" : "1");
      set(canvasWrapRef.current, "opacity", ready[0] ? "1" : "0");

      // CSS fallback layers (not rendered in WebGL mode).
      const veil = (s.a.kind === "color" && s.a.color === "ink" ? 1 - s.mix : 0) + s.dim * (1 - s.mix);
      set(inkRef.current, "opacity", op(ready[0] ? veil : 0));
      set(paperRef.current, "opacity", op(s.b.kind === "color" && s.b.color === "paper" ? s.mix : 0));
      els.forEach((v, i) => {
        const isA = s.a.kind === "clip" && s.a.clip === i;
        const isB = s.b.kind === "clip" && s.b.clip === i;
        const o = isA && isB ? 1 : isA ? (s.b.kind === "clip" ? 1 - s.mix : 1) : isB ? s.mix : 0;
        set(v, "opacity", op(o));
      });

      // Until a clip has loaded, show the still of the current room instead.
      const shownClip = s.phase === "clip" || s.phase === "transition" ? s.clip : -1;
      const stillKey = shownClip >= 0 && !ready[shownClip] ? `${shownClip}:${Math.max(s.room, 0)}` : null;
      for (const [k, img] of stills) set(img, "opacity", k === stillKey ? "1" : "0");

      const key = s.room >= 0 ? `${s.clip}:${s.room}` : null;
      const chrome =
        (s.phase !== "intro" || s.introProgress > 0.95) && !(s.phase === "outro" && s.outroProgress > 0.35);
      if (key !== lastKey || chrome !== lastChrome) {
        lastKey = key;
        lastChrome = chrome;
        setView({ key, chrome });
      }
    };

    gsap.ticker.add(tick);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      tween.scrollTrigger?.kill();
      tween.kill();
      clearTimeout(loadTimer);
      ac.abort();
      scrubbers.forEach((sc) => sc.destroy());
      els.forEach((v) => {
        v.removeAttribute("src");
        v.load();
      });
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [videos, clips, timeline, variant]);

  // Only render the canvas while the walkthrough is on screen.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(track);
    return () => {
      io.disconnect();
      // This also runs when Next hides the page after navigation (it keeps the
      // DOM). Stop the canvas there, or it keeps rendering frames nobody sees.
      setOnScreen(false);
    };
  }, []);

  const entries = useMemo(
    () => clips.flatMap((c, ci) => c.rooms.map((r, ri) => ({ key: `${ci}:${ri}`, label: r.label }))),
    [clips],
  );

  const goTo = useCallback(
    (key: string) => {
      const track = trackRef.current;
      if (!track) return;
      const [ci, ri] = key.split(":").map(Number);
      const room = clips[ci].rooms[ri];
      const p = timeline.progressAtTime(ci, Math.min(room.start + 0.05, room.end));
      const top = track.getBoundingClientRect().top + window.scrollY;
      const y = top + p * (track.offsetHeight - window.innerHeight);
      if (lenis) {
        lenis.scrollTo(y, { duration: 1.8, easing: gsap.parseEase("halden") as (t: number) => number });
      } else {
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    },
    [clips, timeline, lenis],
  );

  // Navbar turns solid partway through the fade to warm white, never on top of it.
  const solidAt = useCallback(
    (section: HTMLElement) => {
      const track = trackRef.current ?? section;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const p = timeline.outroStart + (1 - timeline.outroStart) * 0.45;
      return top + p * (track.offsetHeight - window.innerHeight);
    },
    [timeline],
  );

  const active = view.key ? view.key.split(":").map(Number) : null;
  const activeRoom = active ? clips[active[0]].rooms[active[1]] : null;

  return (
    <NavHero solidAt={solidAt} data-walkthrough-mode={effects} className="relative bg-ink">
      <div ref={trackRef} style={{ height: `${(timeline.totalUnits + 1) * 100}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden bg-ink">
          {clips.map((c, i) => (
            <video
              key={c.id}
              ref={videoRefs[i]}
              muted
              playsInline
              preload="none"
              aria-hidden
              tabIndex={-1}
              className="absolute inset-0 h-full w-full object-cover opacity-0"
            />
          ))}

          {effects === "css" ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(31_30_28/0.2))]"
            />
          ) : (
            <div ref={canvasWrapRef} className="absolute inset-0 opacity-0">
              <EffectCanvas
                videos={videos}
                clips={clips}
                frameRef={frameRef}
                loadedRef={loadedRef}
                active={onScreen}
                onFail={() => setEffects("css")}
              />
            </div>
          )}

          <IntroBackdrop
            poster={clips[0].poster}
            wrapperRef={posterRef}
            className="transition-opacity duration-700 ease-halden"
          />

          {/* Shown only while the current clip is still downloading. */}
          {clips.flatMap((c, ci) =>
            c.rooms.map((r, ri) => {
              const key = `${ci}:${ri}`;
              return (
                <Image
                  key={key}
                  ref={(el) => {
                    if (el) stillNodes.current.set(key, el);
                    else stillNodes.current.delete(key);
                  }}
                  src={r.still}
                  alt=""
                  aria-hidden
                  fill
                  sizes="100vw"
                  className="object-cover opacity-0"
                />
              );
            }),
          )}

          {effects === "css" ? (
            <>
              <div ref={inkRef} aria-hidden className="absolute inset-0 bg-ink opacity-0" />
              <div ref={paperRef} aria-hidden className="absolute inset-0 bg-paper opacity-0" />
            </>
          ) : null}

          {/* Thin scrims, only while captions are on screen. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-halden",
              view.chrome && activeRoom ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-ink/30 via-ink/10 to-transparent" />
            {/* Caption corner only: bright windows behind the text need more than the general scrim. */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_72%_at_100%_100%,rgb(31_30_28/0.72),rgb(31_30_28/0.4)_45%,transparent_78%)]" />
            <div className="absolute inset-y-0 left-0 hidden w-[26%] bg-linear-to-r from-ink/30 to-transparent md:block" />
          </div>

          <RoomIndex
            entries={entries}
            activeKey={view.key}
            visible={view.chrome}
            onSelect={goTo}
            fillRef={fillRef}
          />
          <RoomOverlay
            room={view.chrome ? activeRoom : null}
            index={active ? active[1] : 0}
            total={active ? clips[active[0]].rooms.length : 0}
          />
          <IntroTitle
            wrapperRef={titleRef}
            title={title}
            eyebrow={eyebrow}
            titleSize={titleSize}
            sentence={sentence}
            cue={firstReady ? "Gulir untuk menyusuri" : `Memuat video ${loadPct}%`}
          />
        </div>
      </div>
    </NavHero>
  );
}
