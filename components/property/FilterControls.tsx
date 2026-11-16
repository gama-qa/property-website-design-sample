"use client";

import { useId } from "react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

type Option<T extends string | number> = { value: T; label: string };

type ControlProps<T extends string | number> = {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

/** Thin native select: 1px line, no fill, no radius. */
export function FilterSelect<T extends string>({ label, value, options, onChange }: ControlProps<T>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2.5">
      <Label as="label" htmlFor={id} className="text-ink/60">
        {label}
      </Label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-9 w-full min-w-[12rem] cursor-pointer border border-ink/25 bg-transparent pr-9 pl-3 text-[0.8125rem] text-ink transition-colors duration-300 ease-halden hover:border-ink focus-visible:border-ink"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-1.5 -translate-y-[70%] rotate-45 border-r border-b border-ink"
        />
      </div>
    </div>
  );
}

/** Thin segmented control: one row of options, the chosen one filled in ink. */
export function FilterSegmented<T extends string | number>({ label, value, options, onChange }: ControlProps<T>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2.5">
      <Label id={id} className="text-ink/60">
        {label}
      </Label>
      <div role="radiogroup" aria-labelledby={id} className="flex h-9 border border-ink/25">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex-1 border-l border-ink/25 px-3.5 text-[0.8125rem] whitespace-nowrap tabular-nums transition-colors duration-300 ease-halden first:border-l-0 focus-visible:outline-offset-[-3px]",
                checked ? "bg-ink text-paper" : "text-ink hover:bg-ink/6",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
