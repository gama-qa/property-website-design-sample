"use client";

import type { Ref } from "react";
import { cn } from "@/lib/cn";

export type IndexEntry = { key: string; label: string };

type Props = {
  entries: IndexEntry[];
  activeKey: string | null;
  visible: boolean;
  onSelect: (key: string) => void;
  /** Filled 0..1 by the engine every frame (scaleY), no React re-render. */
  fillRef: Ref<HTMLSpanElement>;
};

/** Thin room list on the left edge with a 1px progress line. */
export function RoomIndex({ entries, activeKey, visible, onSelect, fillRef }: Props) {
  return (
    <nav
      aria-label="Ruang"
      className={cn(
        "absolute top-1/2 left-4 hidden -translate-y-1/2 text-paper transition-opacity duration-700 ease-halden sm:left-8 md:block lg:left-16",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="relative pl-5">
        <span aria-hidden className="absolute top-0 bottom-0 left-0 w-px bg-paper/25" />
        <span
          ref={fillRef}
          aria-hidden
          className="absolute top-0 bottom-0 left-0 w-px origin-top scale-y-0 bg-paper"
        />
        <ol className="flex flex-col gap-3.5">
          {entries.map((e, i) => {
            const active = e.key === activeKey;
            return (
              <li key={e.key}>
                <button
                  type="button"
                  onClick={() => onSelect(e.key)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex items-baseline gap-3 text-[0.75rem] tracking-[0.02em] transition-opacity duration-700 ease-halden hover:opacity-100",
                    active ? "opacity-100" : "opacity-50",
                  )}
                >
                  <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>{e.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
