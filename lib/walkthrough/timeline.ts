import type { Clip, FramePoint, ScrollWeight } from "./data";

/**
 * Scroll budget, in viewport heights of scrolling.
 * The video gets PER_SECOND per second of footage (more where scrollWeights say so).
 */
export const UNITS = {
  intro: 1.1,
  transition: 1.0,
  outro: 1.1,
  // At 48 fps footage this is one frame per ~17px of scroll on a 900px screen:
  // steps small enough to read as motion. The clip's own scrollWeights add
  // distance where the camera moves fastest.
  perSecond: 0.9,
} as const;

export type Units = { intro: number; transition: number; outro: number; perSecond: number };

/**
 * Shorter budget for a walkthrough that opens a detail page: the visitor came
 * for the facts below it, so it should not take as long to pass.
 */
export const COMPACT_UNITS: Units = { intro: 0.9, transition: 0.8, outro: 0.9, perSecond: 0.7 };

/**
 * Charcoal veil over frame 0 behind the opening title (also used by the
 * CSS/still layers). Light enough that the warm facade still reads; the
 * title block adds its own bottom scrim for the small text.
 */
export const INTRO_DIM = 0.42;

export type Source = { kind: "color"; color: "ink" | "paper" } | { kind: "clip"; clip: number };

export type Phase = "intro" | "clip" | "transition" | "outro";

export type FrameState = {
  phase: Phase;
  /** Outgoing (a) and incoming (b) layer, blended by `mix`. */
  a: Source;
  b: Source;
  mix: number;
  /** Charcoal veil over layer a (0..1); the opening reveals the frame without it. */
  dim: number;
  /** Focus of the dissolve in frame coordinates of `focusClip`, or null for a plain dissolve. */
  focus: FramePoint | null;
  focusClip: number;
  /** Target currentTime per clip; null when the clip is not on screen. */
  times: (number | null)[];
  /** Clip whose rooms are shown, and the active room (-1 = none). */
  clip: number;
  room: number;
  introProgress: number;
  outroProgress: number;
  /** 0..1 across all video segments, for the progress line. */
  videoProgress: number;
};

type TimeMap = {
  units: number;
  timeAt: (u: number) => number;
  unitsAt: (t: number) => number;
};

/** Piecewise-linear map between seconds and scroll units, stretched where weighted. */
function buildTimeMap(duration: number, weights: ScrollWeight[]): TimeMap {
  const cuts = new Set<number>([0, duration]);
  for (const w of weights) {
    cuts.add(Math.min(Math.max(w.from, 0), duration));
    cuts.add(Math.min(Math.max(w.to, 0), duration));
  }
  const pts = [...cuts].sort((a, b) => a - b);
  const parts: { t0: number; t1: number; u0: number; u1: number }[] = [];
  let u = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const t0 = pts[i];
    const t1 = pts[i + 1];
    const weight = weights.find((w) => t0 >= w.from && t1 <= w.to)?.weight ?? 1;
    const len = (t1 - t0) * weight;
    parts.push({ t0, t1, u0: u, u1: u + len });
    u += len;
  }
  return {
    units: u,
    timeAt(x) {
      const p = parts.find((s) => x <= s.u1) ?? parts[parts.length - 1];
      const k = p.u1 === p.u0 ? 0 : (x - p.u0) / (p.u1 - p.u0);
      return p.t0 + Math.min(Math.max(k, 0), 1) * (p.t1 - p.t0);
    },
    unitsAt(t) {
      const p = parts.find((s) => t <= s.t1) ?? parts[parts.length - 1];
      const k = p.t1 === p.t0 ? 0 : (t - p.t0) / (p.t1 - p.t0);
      return p.u0 + Math.min(Math.max(k, 0), 1) * (p.u1 - p.u0);
    },
  };
}

type Segment = {
  phase: Phase;
  clip: number;
  units: number;
  start: number;
  end: number;
  map?: TimeMap;
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

export type Timeline = ReturnType<typeof buildTimeline>;

export function buildTimeline(clips: Clip[], units: Units = UNITS) {
  if (clips.length === 0) throw new Error("A walkthrough needs at least one clip.");

  const segs: Segment[] = [];
  segs.push({ phase: "intro", clip: 0, units: units.intro, start: 0, end: 0 });
  clips.forEach((c, i) => {
    const map = buildTimeMap(c.duration, c.scrollWeights);
    segs.push({ phase: "clip", clip: i, units: map.units * units.perSecond, start: 0, end: 0, map });
    if (i < clips.length - 1) segs.push({ phase: "transition", clip: i, units: units.transition, start: 0, end: 0 });
  });
  segs.push({ phase: "outro", clip: clips.length - 1, units: units.outro, start: 0, end: 0 });

  const totalUnits = segs.reduce((s, x) => s + x.units, 0);
  let acc = 0;
  for (const s of segs) {
    s.start = acc / totalUnits;
    acc += s.units;
    s.end = acc / totalUnits;
  }

  const clipSegs = segs.filter((s) => s.phase === "clip");
  const videoUnits = clipSegs.reduce((s, x) => s + x.units, 0);
  const lastFrame = (i: number) => Math.max(clips[i].duration - 1 / clips[i].fps, 0);
  const emptyTimes = () => clips.map(() => null as number | null);

  function videoProgressAt(p: number) {
    let done = 0;
    for (const s of clipSegs) {
      if (p >= s.end) done += s.units;
      else if (p > s.start) done += ((p - s.start) / (s.end - s.start)) * s.units;
    }
    return videoUnits === 0 ? 0 : done / videoUnits;
  }

  function stateAt(progress: number): FrameState {
    const p = clamp01(progress);
    const seg = segs.find((s) => p <= s.end) ?? segs[segs.length - 1];
    const local = seg.end === seg.start ? 1 : clamp01((p - seg.start) / (seg.end - seg.start));
    const times = emptyTimes();
    const last = clips.length - 1;
    const base = { videoProgress: videoProgressAt(p), introProgress: 1, outroProgress: 0, dim: 0 };

    switch (seg.phase) {
      case "intro":
        times[0] = 0;
        return {
          ...base,
          phase: "intro",
          // Frame 0 under a charcoal veil; the "door" reveals it unveiled.
          a: { kind: "clip", clip: 0 },
          b: { kind: "clip", clip: 0 },
          dim: INTRO_DIM,
          // Title clears first; the "door" opens over the remaining 80%.
          mix: smooth((local - 0.2) / 0.8),
          focus: clips[0].focusIn,
          focusClip: 0,
          times,
          clip: 0,
          room: -1,
          introProgress: local,
        };
      case "clip": {
        const c = clips[seg.clip];
        const t = seg.map!.timeAt(local * seg.map!.units);
        times[seg.clip] = t;
        let room = c.rooms.findIndex((r) => t >= r.start && t < r.end);
        if (room === -1) room = c.rooms.length - 1;
        return {
          ...base,
          phase: "clip",
          a: { kind: "clip", clip: seg.clip },
          b: { kind: "clip", clip: seg.clip },
          mix: 0,
          focus: null,
          focusClip: seg.clip,
          times,
          clip: seg.clip,
          room,
        };
      }
      case "transition":
        times[seg.clip] = lastFrame(seg.clip);
        times[seg.clip + 1] = 0;
        return {
          ...base,
          phase: "transition",
          a: { kind: "clip", clip: seg.clip },
          b: { kind: "clip", clip: seg.clip + 1 },
          mix: smooth(local),
          focus: clips[seg.clip].focusOut,
          focusClip: seg.clip,
          times,
          clip: seg.clip + 1,
          room: -1,
        };
      case "outro":
      default:
        times[last] = lastFrame(last);
        return {
          ...base,
          phase: "outro",
          a: { kind: "clip", clip: last },
          b: { kind: "color", color: "paper" },
          mix: smooth(local),
          focus: clips[last].focusOut,
          focusClip: last,
          times,
          clip: last,
          room: -1,
          outroProgress: local,
        };
    }
  }

  /** Scroll progress (0..1) at which a clip reaches time t. */
  function progressAtTime(clip: number, t: number) {
    const s = clipSegs[clip];
    const local = s.map!.unitsAt(t) / s.map!.units;
    return s.start + local * (s.end - s.start);
  }

  /** Where each segment ends, for things like the navbar handoff. */
  const outroStart = segs[segs.length - 1].start;

  return { clips, totalUnits, stateAt, progressAtTime, outroStart, clipSegs };
}
