"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/providers/LenisProvider";
import { cn } from "@/lib/cn";
import { EASE_HALDEN } from "@/lib/motion";

const noopSubscribe = () => () => {};
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog. */
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

/**
 * Modal dialog: charcoal scrim (no blur), paper panel. Esc or the scrim
 * closes it, Tab stays inside, the page behind does not scroll, and focus
 * returns to whatever opened it.
 */
export function Dialog({ open, onClose, labelledBy, children, className }: Props) {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lenis?.stop();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Wait a frame so the panel exists, then move focus into it.
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      lenis?.start();
      previous?.focus({ preventScroll: true });
    };
  }, [open, lenis]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-stretch justify-center sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-ink/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_HALDEN }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            // The panel scrolls on its own; without this Lenis would take the wheel.
            data-lenis-prevent
            className={cn(
              "relative w-full overflow-y-auto overscroll-contain bg-paper text-ink outline-none sm:max-h-[calc(100svh-3rem)] sm:max-w-[46rem]",
              className,
            )}
            initial={{ opacity: 0, y: reduced ? 0 : 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16 }}
            transition={{ duration: 0.7, ease: EASE_HALDEN }}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
