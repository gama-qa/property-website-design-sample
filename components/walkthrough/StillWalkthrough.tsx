"use client";

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { NavHero } from "@/components/layout/NavHero";
import { useSuspendLenis } from "@/components/providers/LenisProvider";
import type { Clip, Room } from "@/lib/walkthrough/data";
import { EASE_HALDEN } from "@/lib/motion";
import { IntroBackdrop } from "./IntroBackdrop";
import { IntroTitle, type TitleSize } from "./IntroTitle";
import { RoomOverlay } from "./RoomOverlay";

type Props = {
  clips: Clip[];
  title: string;
  eyebrow?: string;
  sentence: string;
  titleSize?: TitleSize;
  reason: string;
};

function StillPanel({
  room,
  index,
  total,
  fadeToPaper,
}: {
  room: Room;
  index: number;
  total: number;
  fadeToPaper: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.55 });
  // Last panel: turn to warm white as it leaves, into the next section.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["end end", "end start"] });
  // Short ramp: a half-transparent paper layer over a dark photo reads as grey.
  const paper = useTransform(scrollYProgress, [0.05, 0.45], [0, 1]);

  return (
    <div ref={ref} className="relative h-svh snap-start snap-always overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: inView ? 1 : 0.35 }}
        transition={{ duration: reduced ? 0.2 : 1.2, ease: EASE_HALDEN }}
      >
        <Image src={room.still} alt={room.sentence} fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%] bg-linear-to-t from-ink/85 via-ink/55 via-45% to-transparent"
      />
      <RoomOverlay room={inView ? room : null} index={index} total={total} />
      {fadeToPaper ? (
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-paper" style={{ opacity: paper }} />
      ) : null}
    </div>
  );
}

/**
 * Fallback for phones, reduced motion and missing WebGL: one fullscreen
 * still per room with native scroll-snap. Lenis is suspended here because it
 * does not work with CSS scroll-snap.
 */
export function StillWalkthrough({ clips, title, eyebrow, sentence, titleSize, reason }: Props) {
  useSuspendLenis(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("snap-walkthrough");
    return () => root.classList.remove("snap-walkthrough");
  }, []);

  const panels = clips.flatMap((c) => c.rooms.map((r, i) => ({ room: r, index: i, total: c.rooms.length })));

  // Navbar turns solid while the last panel is fading to paper.
  const solidAt = useCallback((section: HTMLElement) => {
    const r = section.getBoundingClientRect();
    return r.bottom + window.scrollY - window.innerHeight * 0.6;
  }, []);

  return (
    <NavHero solidAt={solidAt} data-walkthrough-mode={`stills:${reason}`} className="relative bg-ink">
      <div className="relative h-svh snap-start overflow-hidden bg-ink">
        <IntroBackdrop poster={clips[0].poster} />
        <IntroTitle title={title} eyebrow={eyebrow} sentence={sentence} titleSize={titleSize} />
      </div>
      {panels.map((p, i) => (
        <StillPanel
          key={`${p.room.id}-${i}`}
          room={p.room}
          index={p.index}
          total={p.total}
          fadeToPaper={i === panels.length - 1}
        />
      ))}
    </NavHero>
  );
}
