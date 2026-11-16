"use client";

import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * A line of large type that drifts slowly, speeds up with the scroll and
 * follows its direction. Decorative (aria-hidden): the same words are on the
 * page as headings. Still under reduced motion; idle while off screen.
 */
export function VelocityMarquee({ items, baseVelocity = -1.6 }: { items: string[]; baseVelocity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref);
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 60, stiffness: 300 });
  const factor = useTransform(velocity, [0, 1000], [0, 3], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() + move);
  });

  const line = items.join(" · ") + " · ";

  return (
    <div ref={ref} aria-hidden className="overflow-hidden border-y border-stone py-6 md:py-10">
      <motion.div className="flex w-max whitespace-nowrap" style={reduced ? undefined : { x }}>
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="pr-[0.3em] font-display text-[clamp(3rem,9vw,8.5rem)] leading-none text-ink/85"
          >
            {line.repeat(3)}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
