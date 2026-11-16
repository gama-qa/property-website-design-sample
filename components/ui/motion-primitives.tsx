"use client";

import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE_HALDEN } from "@/lib/motion";

/**
 * Scroll-reveal building blocks for the sections below the walkthrough.
 * All of them run once when the element enters the viewport, use the house
 * easing, and never bounce. With prefers-reduced-motion they fade only:
 * no movement, no wipes.
 */
const VIEWPORT = { once: true, amount: 0.3 } as const;

/**
 * Text that rises word by word from behind a mask. The full string is exposed
 * to assistive technology once; the animated words are hidden from it.
 */
export function RevealText({
  text,
  as,
  className,
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const Tag = (as ?? "span") as ElementType;
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="shown"
        viewport={VIEWPORT}
        transition={{ staggerChildren: reduced ? 0 : stagger, delayChildren: delay }}
      >
        {words.map((word, i) => (
          // Padding and negative margin keep descenders (g, y, p) inside the mask.
          <span key={`${word}-${i}`} className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              variants={{
                hidden: reduced ? { opacity: 0 } : { y: "108%" },
                shown: { y: "0%", opacity: 1, transition: { duration: 1.15, ease: EASE_HALDEN } },
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

/** A 1px rule that draws itself from the left. */
export function DrawLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={cn("block h-px w-full origin-left bg-stone", className)}
      initial={reduced ? { opacity: 0 } : { scaleX: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1.4, ease: EASE_HALDEN, delay }}
    />
  );
}

const staggerParent: Variants = {
  hidden: {},
  shown: (custom: { stagger: number; delay: number }) => ({
    transition: { staggerChildren: custom.stagger, delayChildren: custom.delay },
  }),
};

/** Container that reveals its <StaggerItem> children one after another. */
export function Stagger({
  children,
  className,
  as,
  stagger = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "dl";
  stagger?: number;
  delay?: number;
}) {
  const Tag = motion[as ?? "div"] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={staggerParent}
      custom={{ stagger, delay }}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as ?? "div"] as typeof motion.div;
  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 22 },
        shown: { opacity: 1, y: 0, transition: { duration: 1.05, ease: EASE_HALDEN } },
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Photograph that is uncovered from the bottom edge upward while it settles
 * from a slight enlargement, like a blind being raised. Wrap the image block.
 *
 * Visibility is watched on the outer, unclipped wrapper. Watching the clipped
 * element itself does not work: with clip-path at 100% the browser reports it
 * as not intersecting, so the reveal would never start.
 */
export function ImageReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="overflow-hidden"
        initial={reduced ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
        animate={inView ? (reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }) : undefined}
        transition={{ duration: 1.5, ease: EASE_HALDEN, delay }}
      >
        <motion.div
          initial={reduced ? false : { scale: 1.12 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: 1.9, ease: EASE_HALDEN, delay }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
