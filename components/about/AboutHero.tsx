"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";
import { EASE_HALDEN } from "@/lib/motion";

type Props = {
  eyebrow: string;
  /** Title, one entry per visual line. */
  lines: string[];
  aside: string;
};

/** Per line: where it sits, and which way it drifts as the hero scrolls away. */
const LINE_STYLE = [
  { className: "", drift: ["0%", "-16%"] },
  { className: "pl-[14vw]", drift: ["0%", "12%"] },
  { className: "text-right", drift: ["0%", "-9%"] },
] as const;

function TitleLine({
  text,
  index,
  progress,
  reduced,
}: {
  text: string;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const style = LINE_STYLE[index % LINE_STYLE.length];
  const x = useTransform(progress, [0, 1], [...style.drift]);

  return (
    <motion.span className={cn("block", style.className)} style={reduced ? undefined : { x }}>
      {/* Mask: letters rise from below the line on load. Padding keeps descenders inside. */}
      <span className="inline-block overflow-hidden pb-[0.08em]">
        {[...text].map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block will-change-transform"
            initial={reduced ? { opacity: 0 } : { y: "105%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            transition={{ duration: 1.25, ease: EASE_HALDEN, delay: 0.15 + index * 0.14 + i * 0.035 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
    </motion.span>
  );
}

/**
 * Oversized display title. Letters rise into place on load; as the visitor
 * scrolls, the lines drift apart sideways and the block fades a little.
 */
export function AboutHero({ eyebrow, lines, aside }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  return (
    <section ref={ref} className="relative overflow-x-clip pt-[calc(var(--spacing-nav)+3.5rem)] pb-16 md:pb-24">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE_HALDEN }}
        >
          <Label className="text-ink/60">{eyebrow}</Label>
        </motion.div>
      </Container>

      <motion.h1
        className="mt-8 px-4 font-display text-[clamp(4.25rem,min(17vw,27svh),17rem)] leading-[0.84] font-normal tracking-[-0.01em] sm:px-8 lg:px-16"
        style={reduced ? undefined : { opacity }}
      >
        <span className="sr-only">{lines.join(" ")}</span>
        <span aria-hidden>
          {lines.map((line, i) => (
            <TitleLine key={line} text={line} index={i} progress={scrollYProgress} reduced={reduced} />
          ))}
        </span>
      </motion.h1>

      <Container className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12">
        <motion.p
          className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-ink/70 md:col-span-5 md:col-start-8"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE_HALDEN, delay: 0.8 }}
        >
          {aside}
        </motion.p>
      </Container>
    </section>
  );
}
