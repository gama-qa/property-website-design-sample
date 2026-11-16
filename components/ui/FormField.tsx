import type { ReactNode } from "react";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";

/** Shared look for inputs, selects and textareas: 1px line, no fill, no radius. */
export const controlClass =
  "w-full border bg-transparent px-3 text-[0.9375rem] text-ink transition-colors duration-300 ease-halden placeholder:text-ink/35 hover:border-ink/60 focus-visible:border-ink focus-visible:outline-offset-2";

/** Border class for a control, solid when it has an error. */
export const controlBorder = (hasError: boolean) => (hasError ? "border-ink" : "border-ink/25");

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/**
 * Label, control and error message for one form field. The control must use
 * `id`, and `aria-describedby={`${id}-error`}` while it has an error.
 */
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      {/* Fixed height so fields with and without a hint line up across columns. */}
      <div className="flex h-4 items-end justify-between gap-4 leading-none">
        <Label as="label" htmlFor={id} className="text-ink/70">
          {label}
        </Label>
        {hint ? <span className="text-[0.75rem] text-ink/50">{hint}</span> : null}
      </div>
      <div className="mt-2.5">{children}</div>
      {/* No red in the palette: the error is carried by the text, a marker and a solid border. */}
      <p id={`${id}-error`} className={cn("mt-2 flex gap-2 text-[0.8125rem] leading-snug", error ? "text-ink" : "hidden")}>
        <span aria-hidden className="mt-[0.4em] size-1.5 shrink-0 bg-ink" />
        <span>{error}</span>
      </p>
    </div>
  );
}

/** Thin chevron for a native select; position it inside a `relative` wrapper. */
export function SelectChevron() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-3.5 size-1.5 -translate-y-[70%] rotate-45 border-r border-b border-ink"
    />
  );
}

/** Calm inline notice for a failed submission. */
export function FormFailure({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 border-t border-ink pt-4 text-[0.875rem] leading-relaxed text-ink">
      <span aria-hidden className="mt-[0.5em] size-1.5 shrink-0 bg-ink" />
      <span>{children}</span>
    </p>
  );
}
