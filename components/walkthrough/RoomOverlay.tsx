"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Label } from "@/components/ui/Label";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";
import type { Room } from "@/lib/walkthrough/data";
import { EASE_HALDEN } from "@/lib/motion";

type Props = {
  room: Room | null;
  index: number;
  total: number;
};

/**
 * Room caption in the bottom-right corner, clear of the centre of the frame.
 * Hierarchy: small index, the room name as the serif heading, one plain
 * sentence, then the figures. Enters slightly from below, as if approached;
 * leaves upward.
 */
export function RoomOverlay({ room, index, total }: Props) {
  const reduced = useReducedMotion();
  const rise = reduced ? 0 : 18;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-4 pb-10 sm:px-8 md:pb-14 lg:px-16">
      <AnimatePresence mode="wait">
        {room ? (
          <motion.div
            key={room.id}
            className="w-full max-w-[25rem] text-paper"
            initial="hidden"
            animate="shown"
            exit="gone"
            variants={{
              hidden: {},
              shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
              gone: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
            }}
          >
            {[
              <Label key="index" as="p" className="flex items-center gap-3 text-paper/75">
                <span className="tabular-nums">
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <span aria-hidden className="h-px w-8 bg-current" />
              </Label>,
              <h2
                key="name"
                className="mt-4 font-display text-[clamp(2rem,2.7vw,2.5rem)] leading-[1.05] font-normal"
              >
                {room.name}
              </h2>,
              <p key="sentence" className="mt-4 max-w-[36ch] text-[0.9375rem] leading-relaxed text-paper/85">
                {room.sentence}
              </p>,
              <SpecList key="specs" className="mt-6 border-t border-paper/25">
                {room.specs.map((s) => (
                  <SpecRow key={s.label} tone="paper" label={s.label} value={s.value} className="py-2.5" />
                ))}
              </SpecList>,
            ].map((child) => (
              <motion.div
                key={child.key}
                variants={{
                  hidden: { opacity: 0, y: rise },
                  shown: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_HALDEN } },
                  gone: { opacity: 0, y: reduced ? 0 : -8, transition: { duration: 0.45, ease: EASE_HALDEN } },
                }}
              >
                {child}
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
