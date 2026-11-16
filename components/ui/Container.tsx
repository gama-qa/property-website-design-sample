import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Page-width wrapper: one max width, wide side margins, 16px gutter on phones. */
export function Container<T extends ElementType = "div">({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16", className)}
      {...props}
    />
  );
}
