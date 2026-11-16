import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type AnimatedLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  /** Keep the underline drawn (current page). */
  active?: boolean;
};

/**
 * Text link with a 1px underline that draws in from the left on hover
 * and retracts to the right on leave.
 */
export function AnimatedLink({ active, className, children, ...props }: AnimatedLinkProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn("group relative inline-block py-1", className)}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-700 ease-halden",
          active
            ? "origin-left scale-x-100"
            : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100",
        )}
      />
    </Link>
  );
}
