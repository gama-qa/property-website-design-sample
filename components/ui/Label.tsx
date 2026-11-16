import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type LabelProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Small uppercase sans label for eyebrows, spec keys and room indices. */
export function Label<T extends ElementType = "span">({ as, className, ...props }: LabelProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={cn(
        "font-sans text-[0.6875rem] leading-none font-medium uppercase tracking-[0.14em]",
        className,
      )}
      {...props}
    />
  );
}
