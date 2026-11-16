"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/providers/LenisProvider";
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/cn";
import { EASE_HALDEN } from "@/lib/motion";
import type { PropertyImage } from "@/src/data/properties";

const noopSubscribe = () => () => {};

const arrowButton =
  "flex size-11 items-center justify-center border border-paper/40 bg-ink/55 text-paper transition-colors duration-300 ease-halden hover:bg-paper hover:text-ink focus-visible:bg-paper focus-visible:text-ink disabled:pointer-events-none disabled:opacity-30";

/** Thin arrow drawn with two 1px strokes; `dir` flips it. */
function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={cn("size-4", dir === "prev" && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M1 8h13M9 3l5 5-5 5" />
    </svg>
  );
}

/**
 * Photograph slider. Native horizontal scroll with snap, so swiping on touch
 * works as expected; arrows and thumbnails drive the same scroll position.
 * Clicking a photograph opens it in a fullscreen preview.
 */
export function PropertyCarousel({ images, priority = false }: { images: PropertyImage[]; priority?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const many = images.length > 1;

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const i = Math.min(Math.max(index, 0), images.length - 1);
      track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [images.length, reduced],
  );

  // The scroll position is the source of truth for the active slide.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== current) setCurrent(i);
  };

  return (
    <figure>
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          tabIndex={many ? 0 : -1}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Foto properti, ${images.length} gambar`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") goTo(current + 1);
            if (e.key === "ArrowLeft") goTo(current - 1);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              type="button"
              onClick={() => setPreview(i)}
              aria-label={`Buka foto ${i + 1} dari ${images.length} dalam ukuran penuh`}
              className="group relative aspect-[4/3] max-h-[82svh] w-full shrink-0 cursor-zoom-in snap-center overflow-hidden bg-stone md:aspect-[16/9]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={priority && i === 0}
                sizes="(min-width: 1440px) 1312px, 100vw"
                className="object-cover transition-transform duration-[1400ms] ease-halden group-hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>

        <Label className="pointer-events-none absolute top-0 left-0 bg-paper px-2.5 py-2 text-ink">
          Klik untuk perbesar
        </Label>

        {many ? (
          <div className="absolute right-4 bottom-4 flex gap-2">
            <button
              type="button"
              className={arrowButton}
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
              aria-label="Foto sebelumnya"
            >
              <Arrow dir="prev" />
            </button>
            <button
              type="button"
              className={arrowButton}
              onClick={() => goTo(current + 1)}
              disabled={current === images.length - 1}
              aria-label="Foto berikutnya"
            >
              <Arrow dir="next" />
            </button>
          </div>
        ) : null}
      </div>

      <figcaption className="mt-4 flex items-baseline justify-between gap-6 text-[0.8125rem] text-ink/60">
        <span className="max-w-[70ch]">{images[current]?.alt}</span>
        {many ? (
          <span className="shrink-0 tabular-nums" aria-live="polite">
            {current + 1} / {images.length}
          </span>
        ) : null}
      </figcaption>

      {many ? (
        <ul className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Tampilkan foto ${i + 1} dari ${images.length}`}
                aria-current={i === current}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden border transition-opacity duration-500 ease-halden",
                  i === current ? "border-ink opacity-100" : "border-transparent opacity-55 hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 12vw, 25vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Lightbox
        images={images}
        index={preview}
        onChange={setPreview}
        onClose={() => {
          // Leave the slider on the photograph that was last previewed, and put
          // focus on that slide. preventScroll matters: a normal focus() would
          // scroll the slider back to whichever slide had focus before.
          const last = preview;
          setPreview(null);
          if (last === null) return;
          goTo(last);
          requestAnimationFrame(() => slideRefs.current[last]?.focus({ preventScroll: true }));
        }}
      />
    </figure>
  );
}

type LightboxProps = {
  images: PropertyImage[];
  /** Index of the open photograph, or null when closed. */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

/** Fullscreen preview: arrows, arrow keys or swipe to move; Tutup or Esc to close. */
function Lightbox({ images, index, onChange, onClose }: LightboxProps) {
  const lenis = useLenis();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const many = images.length > 1;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onChange],
  );

  // Latest handlers for the key listener, so the effect below runs once per open/close.
  const stepRef = useRef(step);
  const closeHandlerRef = useRef(onClose);
  useEffect(() => {
    stepRef.current = step;
    closeHandlerRef.current = onClose;
  });

  // While open: lock page scroll, handle keys and keep focus inside. The carousel restores focus on close.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeHandlerRef.current();
      else if (e.key === "ArrowRight") stepRef.current(1);
      else if (e.key === "ArrowLeft") stepRef.current(-1);
      else if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      lenis?.start();
    };
  }, [open, lenis]);

  if (!mounted) return null;
  const shown = index ?? 0;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau foto ${shown + 1} dari ${images.length}`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink text-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_HALDEN }}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-8">
            <span className="text-[0.8125rem] tabular-nums text-paper/70">
              {shown + 1} / {images.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="border border-paper/40 px-4 py-2 text-[0.75rem] transition-colors duration-300 ease-halden hover:bg-paper hover:text-ink focus-visible:bg-paper focus-visible:text-ink"
            >
              Tutup
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={images[shown].src}
                className="absolute inset-0 px-4 sm:px-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE_HALDEN }}
                drag={many ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) step(1);
                  else if (info.offset.x > 70) step(-1);
                }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={images[shown].src}
                    alt={images[shown].alt}
                    fill
                    sizes="100vw"
                    draggable={false}
                    className="pointer-events-none object-contain select-none"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {many ? (
              <>
                <button
                  type="button"
                  className={cn(arrowButton, "absolute top-1/2 left-4 -translate-y-1/2 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0")}
                  onClick={() => step(-1)}
                  aria-label="Foto sebelumnya"
                >
                  <Arrow dir="prev" />
                </button>
                <button
                  type="button"
                  className={cn(arrowButton, "absolute top-1/2 right-4 -translate-y-1/2 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0")}
                  onClick={() => step(1)}
                  aria-label="Foto berikutnya"
                >
                  <Arrow dir="next" />
                </button>
              </>
            ) : null}
          </div>

          <p className="shrink-0 px-4 py-5 text-center text-[0.8125rem] leading-relaxed text-paper/70 sm:px-20">
            {images[shown].alt}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
