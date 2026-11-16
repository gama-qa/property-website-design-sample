"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { NavHero } from "@/components/layout/NavHero";
import { detectWalkthroughMode, type WalkthroughMode } from "@/lib/capabilities";
import { getClips } from "@/lib/walkthrough/data";
import { IntroBackdrop } from "./IntroBackdrop";
import { IntroTitle, type TitleSize } from "./IntroTitle";
import { ScrubWalkthrough } from "./ScrubWalkthrough";
import { StillWalkthrough } from "./StillWalkthrough";

type Props = {
  /** Walkthrough ids from src/data/walkthrough.json, in viewing order. */
  clipIds: string[];
  title: string;
  eyebrow?: string;
  sentence: string;
  /** "brand" (home) or "page" (a property name). */
  titleSize?: TitleSize;
  /** Shorter scroll distance, for the walkthrough at the top of a detail page. */
  compact?: boolean;
};

const noopSubscribe = () => () => {};

/**
 * Chooses one rendering mode on the client and renders only that one, so the
 * other mode's assets are never requested. The server renders the opening
 * title screen, which both modes share, so the swap is not visible.
 */
export function Walkthrough({ clipIds, title, eyebrow, sentence, titleSize = "brand", compact = false }: Props) {
  const key = clipIds.join(",");
  const clips = useMemo(() => getClips(key.split(",")), [key]);
  const detected = useSyncExternalStore<WalkthroughMode | null>(noopSubscribe, detectWalkthroughMode, () => null);
  const [failure, setFailure] = useState<string | null>(null);

  if (!detected) {
    return (
      <NavHero className="relative h-svh overflow-hidden bg-ink">
        <IntroBackdrop poster={clips[0].poster} />
        <IntroTitle title={title} eyebrow={eyebrow} sentence={sentence} titleSize={titleSize} cue={null} />
      </NavHero>
    );
  }

  if (failure || detected.mode === "stills") {
    return (
      <StillWalkthrough
        clips={clips}
        title={title}
        eyebrow={eyebrow}
        sentence={sentence}
        titleSize={titleSize}
        reason={failure ?? detected.reason}
      />
    );
  }

  return (
    <ScrubWalkthrough
      clips={clips}
      effects={detected.effects}
      variant={detected.video}
      title={title}
      eyebrow={eyebrow}
      sentence={sentence}
      titleSize={titleSize}
      compact={compact}
      onFail={setFailure}
    />
  );
}
