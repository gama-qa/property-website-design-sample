"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/cn";

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/**
 * A paragraph whose words light up one after another as it scrolls through
 * the viewport, so it is read at the pace of the scroll. The text is always
 * in the DOM in full; only opacity changes. Static under reduced motion.
 */
export function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = text.split(" ");

  if (reduced) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={cn(className)}>
      {words.map((word, i) => (
        <Word
          key={`${word}-${i}`}
          word={word}
          range={[i / words.length, (i + 1) / words.length]}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}
