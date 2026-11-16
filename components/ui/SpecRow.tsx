import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Wrapper for SpecRow items. Renders a description list. */
export function SpecList({ className, ...props }: ComponentPropsWithoutRef<"dl">) {
  return <dl className={cn("w-full", className)} {...props} />;
}

type SpecRowProps = {
  label: ReactNode;
  value: ReactNode;
  /** Optional unit or note shown after the value in a quieter tone. */
  note?: ReactNode;
  tone?: "ink" | "paper";
  className?: string;
};

/** Key on the left, value on the right, 1px line below. Numbers are tabular. */
export function SpecRow({ label, value, note, tone = "ink", className }: SpecRowProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-b py-3.5",
        tone === "ink" ? "border-stone" : "border-paper/20",
        className,
      )}
    >
      <dt
        className={cn(
          "text-[0.8125rem] leading-snug",
          tone === "ink" ? "text-ink/60" : "text-paper/65",
        )}
      >
        {label}
      </dt>
      <dd className="text-right text-[0.9375rem] leading-snug tabular-nums">
        {value}
        {note ? (
          <span className={cn("ml-1.5", tone === "ink" ? "text-ink/50" : "text-paper/55")}>
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  );
}
