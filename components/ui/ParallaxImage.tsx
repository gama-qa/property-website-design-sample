"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  alt: string;
  /** Tailwind classes for the frame (aspect ratio, max height). */
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * A photograph that drifts slower than the page while it crosses the
 * viewport. The image is 18% taller than its frame and moves 9% each way, so
 * no edge is ever exposed. Still under prefers-reduced-motion.
 */
export function ParallaxImage({ src, alt, className, sizes = "100vw", priority = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-stone", className)}>
      <motion.div className="absolute inset-x-0 -inset-y-[9%] will-change-transform" style={reduced ? undefined : { y }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </motion.div>
    </div>
  );
}
