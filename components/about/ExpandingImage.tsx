"use client";

import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ParallaxImage } from "@/components/ui/ParallaxImage";

type Props = { src: string; alt: string; caption: string };

/**
 * Full-width photograph that starts inset, like a framed print, and opens to
 * the full width of the page as it reaches the middle of the screen. The
 * image inside also drifts (parallax). Plain under reduced motion.
 */
export function ExpandingImage({ src, alt, caption }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const side = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const vertical = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const clipPath = useMotionTemplate`inset(${vertical}% ${side}% ${vertical}% ${side}%)`;

  return (
    <figure ref={ref}>
      <motion.div style={reduced ? undefined : { clipPath }}>
        <ParallaxImage
          src={src}
          alt={alt}
          className="aspect-[4/3] max-h-[92svh] w-full md:aspect-[16/9]"
          sizes="100vw"
          priority
        />
      </motion.div>
      <figcaption className="mx-auto mt-4 w-full max-w-[1440px] px-4 text-[0.8125rem] text-ink/60 sm:px-8 lg:px-16">
        {caption}
      </figcaption>
    </figure>
  );
}
