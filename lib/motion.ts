/**
 * Single source for motion values shared by CSS (see `--ease-halden`),
 * GSAP and Motion. Slow, long-tail, never bouncy.
 */
export const EASE_HALDEN = [0.16, 1, 0.3, 1] as const;
export const EASE_HALDEN_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

export const DURATION = {
  /** Hover/colour changes. */
  fast: 0.7,
  /** Text and UI reveals. */
  reveal: 1.1,
} as const;
