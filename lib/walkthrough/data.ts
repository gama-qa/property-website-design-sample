import data from "@/src/data/walkthrough.json";

export type FramePoint = { x: number; y: number; what?: string };

export type RoomSpec = { label: string; value: string };

export type Room = {
  id: string;
  /** Short label for the room index ("Kitchen"). */
  label: string;
  /** Overlay label ("Living room"). */
  name: string;
  start: number;
  end: number;
  still: string;
  stillTime: number;
  sentence: string;
  specs: RoomSpec[];
};

export type ScrollWeight = { from: number; to: number; weight: number };

export type Clip = {
  id: string;
  video: { desktop: string; mobile: string };
  poster: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  /**
   * 1 when every frame is an original. N when the clip was interpolated to N
   * times its frame rate: only every N-th frame is an original.
   */
  originalEvery: number;
  rooms: Room[];
  scrollWeights: ScrollWeight[];
  /** Focus points in frame coordinates (0..1 from the top-left), or null for a plain dissolve. */
  focusIn: FramePoint | null;
  focusOut: FramePoint | null;
};

type RawClip = (typeof data.walkthroughs)[number];

function toClip(raw: RawClip): Clip {
  return {
    id: raw.id,
    video: raw.video,
    poster: raw.poster,
    width: raw.width,
    height: raw.height,
    duration: raw.duration,
    fps: raw.fps,
    originalEvery: ("interpolationFactor" in raw ? raw.interpolationFactor : undefined) ?? 1,
    rooms: raw.rooms.map((r) => ({
      id: r.id,
      label: r.label,
      name: r.name,
      start: r.start,
      end: r.end,
      still: r.still,
      stillTime: r.stillTime,
      sentence: r.sentence,
      specs: r.specs,
    })),
    scrollWeights: raw.scrollWeights.map((w) => ({ from: w.from, to: w.to, weight: w.weight })),
    focusIn: raw.transitions.focusIn ?? null,
    focusOut: raw.transitions.focusOut ?? null,
  };
}

/** Resolve a sequence of walkthrough ids into clips, in order. */
export function getClips(ids: string[]): Clip[] {
  return ids.map((id) => {
    const raw = data.walkthroughs.find((w) => w.id === id);
    if (!raw) throw new Error(`Unknown walkthrough id: ${id}`);
    return toClip(raw);
  });
}
