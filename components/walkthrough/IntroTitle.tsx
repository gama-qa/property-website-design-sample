"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Ref } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { EASE_HALDEN } from "@/lib/motion";

type Props = {
  title: string;
  sentence: string;
  /** Small line above the title (what and where). */
  eyebrow?: string;
  /** Outer wrapper; the scrub engine fades it as the door opens. */
  wrapperRef?: Ref<HTMLDivElement>;
  /** Text next to the 1px cue line; null hides it. */
  cue?: string | null;
  /** "brand" for the one-word home title, "page" for longer titles such as a property name. */
  titleSize?: TitleSize;
};

export type TitleSize = "brand" | "page";

const TITLE_SIZES: Record<TitleSize, string> = {
  brand: "-ml-[0.02em] text-[clamp(3.5rem,11.5vw,10.5rem)] leading-[0.9] tracking-[0.01em]",
  page: "max-w-[16ch] text-[clamp(2.5rem,6.2vw,5.5rem)] leading-[1] text-balance",
};

/**
 * Opening title over the veiled first frame. Mount reveal via Motion; the
 * scroll fade is applied to the wrapper, which also carries the bottom scrim
 * so the scrim leaves together with the text.
 */
export function IntroTitle({
  title,
  sentence,
  eyebrow,
  wrapperRef,
  cue = "Gulir untuk menyusuri",
  titleSize = "brand",
}: Props) {
  const reduced = useReducedMotion();
  const rise = reduced ? 0 : 28;

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 flex items-end text-paper will-change-transform">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-ink/75 via-ink/30 to-transparent" />
      <Container className="relative pb-12 md:pb-16">
        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE_HALDEN }}
          >
            <Label className="text-paper/80">{eyebrow}</Label>
          </motion.div>
        ) : null}
        <motion.h1
          className={`mt-5 font-display font-normal ${TITLE_SIZES[titleSize]}`}
          initial={{ opacity: 0, y: rise }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: EASE_HALDEN, delay: 0.1 }}
        >
          {title}
        </motion.h1>
        <div className="mt-9 flex flex-col gap-8 border-t border-paper/25 pt-6 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-[40ch] text-[0.9375rem] leading-relaxed text-paper/85"
            initial={{ opacity: 0, y: rise / 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE_HALDEN, delay: 0.35 }}
          >
            {sentence}
          </motion.p>
          {cue ? (
            <motion.div
              className="flex items-center gap-3 text-paper/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: EASE_HALDEN, delay: 0.7 }}
            >
              <span aria-hidden className="h-px w-10 bg-current" />
              <Label className="tabular-nums" aria-live="polite">
                {cue}
              </Label>
            </motion.div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
