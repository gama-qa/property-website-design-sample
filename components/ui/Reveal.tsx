"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_HALDEN } from "@/lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds; use small steps to stagger siblings. */
  delay?: number;
};

/** Fades content in from slightly below, once, when it enters the viewport. */
export function Reveal({ children, className, delay = 0 }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: EASE_HALDEN, delay }}
    >
      {children}
    </motion.div>
  );
}
