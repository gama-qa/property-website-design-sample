import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

// Scale tuned for Pluvix Luxury: a wide, heavy flared serif. Sizes are about
// 20% smaller than a light serif would need, with no negative tracking and
// looser leading so the heavy strokes do not crowd.
const sizes = {
  display: "text-[clamp(2.5rem,6.4vw,6rem)] leading-[1]",
  xl: "text-[clamp(2.125rem,4vw,3.5rem)] leading-[1.05]",
  lg: "text-[clamp(1.75rem,2.8vw,2.375rem)] leading-[1.1]",
  md: "text-[clamp(1.375rem,1.8vw,1.625rem)] leading-[1.2]",
  sm: "text-[1.1875rem] leading-[1.25]",
} as const;

type HeadingProps = {
  /** Semantic level, independent of visual size. */
  level?: 1 | 2 | 3 | 4;
  size?: keyof typeof sizes;
} & ComponentPropsWithoutRef<"h2">;

/** Display-face heading (Pluvix Luxury). Level sets the tag, size sets the look. */
export function Heading({ level = 2, size = "lg", className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn("font-display font-normal text-balance", sizes[size], className)}
      {...props}
    />
  );
}
