import Image from "next/image";
import type { Ref } from "react";
import { cn } from "@/lib/cn";
import { INTRO_DIM } from "@/lib/walkthrough/timeline";

type Props = {
  /** First frame of the first clip, so the handoff to the video has no jump. */
  poster: string;
  className?: string;
  wrapperRef?: Ref<HTMLDivElement>;
};

/**
 * Background of the opening title: frame 0 under a charcoal veil. Matches the
 * shader's intro state (same frame, same veil) so swapping between them is
 * invisible.
 */
export function IntroBackdrop({ poster, className, wrapperRef }: Props) {
  return (
    <div ref={wrapperRef} aria-hidden className={cn("absolute inset-0", className)}>
      {/* Served as-is: it is already sized and sharpened by scripts/make-stills.mjs. */}
      <Image src={poster} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-ink" style={{ opacity: INTRO_DIM }} />
    </div>
  );
}
