/**
 * One place that decides how the walkthrough renders. Nothing else should
 * sniff devices.
 *
 * - stills: reduced motion, Save-Data, no WebGL, or a phone that isn't capable
 * - scrub + css: scrubbed video with CSS crossfades (weaker desktops, capable phones)
 * - scrub + webgl: scrubbed video through the shader layer
 *
 * Override for testing: ?walkthrough=stills | css | webgl
 */
export type WalkthroughMode =
  | { mode: "stills"; reason: string }
  | { mode: "scrub"; effects: "webgl" | "css"; video: "desktop" | "mobile"; reason: string };

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

let cached: WalkthroughMode | null = null;

export function detectWalkthroughMode(): WalkthroughMode {
  if (cached) return cached;
  cached = compute();
  return cached;
}

function compute(): WalkthroughMode {
  const mq = (q: string) => window.matchMedia(q).matches;
  const nav = navigator as NavigatorHints;
  const small = mq("(max-width: 767px)") || mq("(pointer: coarse)");

  const override = new URLSearchParams(window.location.search).get("walkthrough");
  if (override === "stills") return { mode: "stills", reason: "override" };
  if (override === "css" || override === "webgl") {
    return { mode: "scrub", effects: override, video: small ? "mobile" : "desktop", reason: "override" };
  }

  if (mq("(prefers-reduced-motion: reduce)")) return { mode: "stills", reason: "reduced-motion" };
  if (nav.connection?.saveData) return { mode: "stills", reason: "save-data" };
  if (!hasWebGL()) return { mode: "stills", reason: "no-webgl" };

  const memory = nav.deviceMemory ?? 8; // Safari/Firefox don't expose it
  const cores = navigator.hardwareConcurrency ?? 8;
  const weak = memory <= 4 || cores <= 4;

  if (small) {
    return weak
      ? { mode: "stills", reason: "small-weak-device" }
      : { mode: "scrub", effects: "css", video: "mobile", reason: "small-capable-device" };
  }
  return { mode: "scrub", effects: weak ? "css" : "webgl", video: "desktop", reason: weak ? "weak-desktop" : "capable" };
}
