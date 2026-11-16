/**
 * Download a clip completely and return an object URL. Seeking a blob in
 * memory is far steadier than seeking over HTTP range requests.
 */
export async function loadClipBlob(
  url: string,
  onProgress: (fraction: number) => void,
  signal: AbortSignal,
): Promise<string> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;

  if (!res.body || total === 0) {
    const blob = await res.blob();
    onProgress(1);
    return URL.createObjectURL(blob);
  }

  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onProgress(Math.min(received / total, 1));
  }
  return URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
}

/** Attach a source and resolve once the first frame can be drawn. */
export function attachSource(video: HTMLVideoElement, src: string, timeoutMs = 10000) {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("error", fail);
      reject(new Error("Video failed to decode"));
    };
    const timer = setTimeout(fail, timeoutMs);
    video.addEventListener("loadeddata", done);
    video.addEventListener("error", fail);
    video.src = src;
    video.load();
  });
}

/**
 * Seeks a paused <video> towards a target time without flooding the decoder:
 * one seek in flight at a time, the latest target wins, and nothing happens
 * when the requested frame is already on screen. Times are snapped to the
 * middle of a frame so rounding never lands on the neighbour.
 */
export class VideoScrubber {
  private targetFrame = -1;
  private requestedFrame = -1;
  private seekStartedAt = 0;
  private ready = false;
  private restRaw = -1;
  private restFrame = -1;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly fps: number,
    private readonly frames: number,
    private readonly onFrame: () => void,
    private readonly onStall: () => void,
  ) {
    video.addEventListener("seeked", this.handleSeeked);
  }

  setReady() {
    this.ready = true;
    this.pump();
  }

  /**
   * @param snap Land only on every `snap`-th frame. Used at rest for clips with
   *   interpolated in-between frames, so a still view is always an original frame.
   */
  request(time: number, snap = 1) {
    const raw = Math.min(Math.max(Math.floor(time * this.fps), 0), this.frames - 1);
    let frame = raw;
    if (snap > 1) {
      const lastOriginal = Math.floor((this.frames - 1) / snap) * snap;
      frame = Math.min(Math.round(raw / snap) * snap, lastOriginal);
      this.restRaw = raw;
      this.restFrame = frame;
    } else if (raw === this.restRaw) {
      // Motion has resumed but has not left the frame we rested in: hold the
      // rest frame, otherwise the picture would step back by one frame first.
      frame = this.restFrame;
    } else {
      this.restRaw = -1;
    }
    this.targetFrame = frame;
    this.pump();
  }

  /** Call every animation frame. */
  pump() {
    if (!this.ready || this.targetFrame < 0) return;
    const v = this.video;
    if (v.seeking) {
      if (performance.now() - this.seekStartedAt > 4000) this.onStall();
      return;
    }
    if (this.targetFrame === this.requestedFrame) return;
    this.requestedFrame = this.targetFrame;
    this.seekStartedAt = performance.now();
    v.currentTime = (this.targetFrame + 0.5) / this.fps;
  }

  destroy() {
    this.video.removeEventListener("seeked", this.handleSeeked);
  }

  private handleSeeked = () => {
    this.onFrame();
    this.pump();
  };
}
