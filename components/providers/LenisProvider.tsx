"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ensureGsap, gsap, ScrollTrigger } from "@/lib/gsap";

type LenisContextValue = {
  lenis: Lenis | null;
  /** Turn smooth scrolling off until the returned function is called. */
  suspend: () => () => void;
};

const LenisContext = createContext<LenisContextValue>({ lenis: null, suspend: () => () => {} });

/** Access the Lenis instance (null on the server, before mount, or while suspended). */
export function useLenis() {
  return useContext(LenisContext).lenis;
}

/**
 * Disable Lenis while `active` is true (e.g. a section that relies on native
 * CSS scroll-snap, which Lenis does not support).
 */
export function useSuspendLenis(active: boolean) {
  const { suspend } = useContext(LenisContext);
  useEffect(() => (active ? suspend() : undefined), [active, suspend]);
}

/**
 * Smooth scroll driven by the GSAP ticker, so Lenis and ScrollTrigger
 * read the same frame. Lenis honours prefers-reduced-motion itself
 * (`respectReducedMotion`, default true): smoothing off, scroll 1:1.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [suspensions, setSuspensions] = useState(0);
  const enabled = suspensions === 0;

  const suspend = useCallback(() => {
    setSuspensions((n) => n + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setSuspensions((n) => n - 1);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    ensureGsap();

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      anchors: true,
      stopInertiaOnNavigate: true,
    });

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Expose after setup; consumers re-render once with the instance.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [enabled]);

  const value = useMemo(() => ({ lenis, suspend }), [lenis, suspend]);
  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
