"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

type Mode = "default" | "action" | "text";

const ACTION = 'a, button, select, summary, label[for], [role="button"], [role="radio"], input[type="date"]';
const TEXT = 'input:not([type="date"]):not([type="checkbox"]):not([type="radio"]), textarea';

/**
 * Minimal custom cursor, desktop only (a device that can hover and has a fine
 * pointer; never on touch). A small square that becomes a thin frame over
 * things you can click and a thin bar over text fields. Square because the
 * design has no radius anywhere. It uses difference blending, so it reads on
 * both the warm-white pages and the dark footage.
 *
 * The native cursor is hidden only while this component is tracking the
 * pointer (see `html.custom-cursor` in globals.css).
 */
export function Cursor() {
  const enabled = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Overdamped: it trails slightly and settles without any overshoot.
  const spring = { stiffness: 700, damping: 50, mass: 0.35 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const modeRef = useRef<Mode>("default");

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      // Hide the native cursor only once we are actually drawing ours.
      root.classList.add("custom-cursor");
      setVisible(true);
      const target = e.target as Element | null;
      const next: Mode = target?.closest?.(TEXT) ? "text" : target?.closest?.(ACTION) ? "action" : "default";
      if (next !== modeRef.current) {
        modeRef.current = next;
        setMode(next);
      }
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("custom-cursor");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
      style={{ x: reduced ? x : sx, y: reduced ? y : sy }}
    >
      <div
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 border border-paper transition-[width,height,background-color,opacity,scale] duration-500 ease-halden",
          mode === "default" && "size-2 bg-paper",
          mode === "action" && "size-9 bg-transparent",
          mode === "text" && "h-6 w-px bg-paper",
          pressed && "scale-75",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
    </motion.div>
  );
}
