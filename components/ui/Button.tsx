import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Thin outline button. On hover a solid fill rises slowly from the bottom
 * edge and the label inverts. No radius, no shadow, no gradient.
 *
 * tone:
 * - ink   on paper backgrounds (default)
 * - paper on video / ink backgrounds
 * - moss  the accent, only for one small primary CTA per view
 * - context follows `--tone-fg` / `--tone-bg` set by a parent (navbar)
 */
const tones = {
  context:
    "border-(--tone-fg) text-(--tone-fg) before:bg-(--tone-fg) hover:text-(--tone-bg) focus-visible:text-(--tone-bg)",
  ink: "border-ink text-ink before:bg-ink hover:text-paper focus-visible:text-paper",
  paper: "border-paper/70 text-paper before:bg-paper hover:text-ink focus-visible:text-ink",
  moss: "border-moss text-moss before:bg-moss hover:text-paper focus-visible:text-paper",
} as const;

const sizes = {
  sm: "h-9 px-4 text-[0.75rem]",
  md: "h-12 px-6 text-[0.8125rem]",
} as const;

type Common = {
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
};

type AsLink = Common & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export type ButtonProps = AsLink | AsButton;

type LinkRest = Omit<AsLink, keyof Common>;
type ButtonRest = Omit<AsButton, keyof Common>;

export function Button({ tone = "ink", size = "md", className, children, ...rest }: ButtonProps) {
  const classes = cn(
    "group relative isolate inline-flex items-center justify-center overflow-hidden border",
    "font-sans font-medium tracking-[0.02em] whitespace-nowrap",
    "transition-colors duration-700 ease-halden",
    "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0",
    "before:transition-transform before:duration-700 before:ease-halden",
    "hover:before:scale-y-100 focus-visible:before:scale-y-100",
    "disabled:pointer-events-none disabled:opacity-40",
    tones[tone],
    sizes[size],
    className,
  );

  if (rest.href !== undefined) {
    const { href, ...linkProps } = rest as LinkRest;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as ButtonRest;
  delete (buttonProps as { href?: unknown }).href;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
