"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { Heading } from "@/components/ui/Heading";
import { RevealText } from "@/components/ui/motion-primitives";

export type Topic = { number: string; title: string; content: ReactNode };

/** Same condition as the `tall:` variant in globals.css. */
const TALL = "(min-width: 64rem) and (min-height: 47.5rem)";
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(TALL);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function Panel({
  topic,
  index,
  total,
  progress,
  stacking,
}: {
  topic: Topic;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stacking: boolean;
}) {
  // Earlier panels shrink a little and dim as later ones slide over them.
  const depth = total - 1 - index;
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - depth * 0.04]);
  const opacity = useTransform(progress, [start, 1], [1, 1 - depth * 0.25]);

  return (
    <div
      className="tall:sticky tall:not-last:mb-[28vh]"
      // Each panel stops a little lower than the one before, so its number and title stay visible.
      style={{ top: `calc(var(--spacing-nav) + ${1.5 + index * 4.25}rem)` }}
    >
      {/* Scale the opaque panel, but dim only its content: dimming the panel itself would let the one below show through. */}
      <motion.section className="origin-top border-t border-ink bg-paper" style={stacking ? { scale } : undefined}>
        <motion.div
          className="grid gap-x-10 gap-y-8 py-12 md:py-16 lg:grid-cols-12"
          style={stacking ? { opacity } : undefined}
        >
          <div className="flex items-baseline gap-6 lg:col-span-4 lg:flex-col lg:gap-4">
            {/* Inter, not the display face: its digits have uneven widths. */}
            <span
              aria-hidden
              className="text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.85] font-light tracking-[-0.03em] text-ink/30 tabular-nums"
            >
              {topic.number}
            </span>
            <Heading size="md" className="max-w-[14ch]">
              <RevealText text={topic.title} />
            </Heading>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">{topic.content}</div>
        </motion.div>
      </motion.section>
    </div>
  );
}

/**
 * Topics as panels that stick and stack while scrolling on large screens:
 * each new panel slides over the previous one, which steps back slightly.
 * On phones, short screens and with reduced motion they are a plain list.
 */
export function StackedTopics({ topics }: { topics: Topic[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const tall = useSyncExternalStore(subscribe, () => window.matchMedia(TALL).matches, () => false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} className="relative">
      {topics.map((topic, i) => (
        <Panel
          key={topic.number}
          topic={topic}
          index={i}
          total={topics.length}
          progress={scrollYProgress}
          stacking={tall && !reduced}
        />
      ))}
    </div>
  );
}
