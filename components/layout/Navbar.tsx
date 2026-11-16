"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useEffect, useState } from "react";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { useLenis } from "@/components/providers/LenisProvider";
import { cn } from "@/lib/cn";
import { DURATION, EASE_HALDEN } from "@/lib/motion";
import { ViewingTrigger } from "@/components/property/ViewingModal";
import { NAV_ITEMS } from "./nav-items";

type LinksProps = { pathname?: string; onNavigate?: () => void; variant: "bar" | "panel" };

function Links({ pathname, onNavigate, variant }: LinksProps) {
  return (
    <ul className={variant === "bar" ? "flex items-center gap-8" : "flex flex-col gap-5"}>
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <AnimatedLink
            href={item.href}
            onClick={onNavigate}
            active={pathname?.startsWith(item.href)}
            className={variant === "bar" ? "text-[0.8125rem]" : "font-display text-[2.5rem] leading-none"}
          >
            {item.label}
          </AnimatedLink>
        </li>
      ))}
    </ul>
  );
}

/** Reads the pathname for the active state; suspends safely under cacheComponents. */
function ActiveLinks(props: Omit<LinksProps, "pathname">) {
  const pathname = usePathname();
  return <Links pathname={pathname} {...props} />;
}

function NavLinks(props: Omit<LinksProps, "pathname">) {
  return (
    <Suspense fallback={<Links {...props} />}>
      <ActiveLinks {...props} />
    </Suspense>
  );
}

/**
 * Fixed navbar. Transparent with a thin top scrim while over a <NavHero>,
 * solid warm white once the hero has scrolled past. State lives in CSS
 * (`over-hero:` variant), not React, so SSR paints the right state.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  return (
    <header
      data-site-nav
      data-menu-open={open ? "" : undefined}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-nav border-b",
        "[--tone-fg:var(--color-ink)] [--tone-bg:var(--color-paper)]",
        "over-hero:[--tone-fg:var(--color-paper)] over-hero:[--tone-bg:var(--color-ink)]",
        "border-stone bg-paper text-(--tone-fg)",
        "over-hero:border-transparent over-hero:bg-transparent",
        "transition-[background-color,border-color,color] duration-700 ease-halden",
      )}
    >
      {/* Thin scrim so paper text stays legible on bright footage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[180%] bg-linear-to-b from-ink/45 to-transparent opacity-0 transition-opacity duration-700 ease-halden over-hero:opacity-100"
      />

      <Container className="flex h-full items-center justify-between">
        <Link href="/" onClick={close} className="flex items-baseline gap-2.5" aria-label="Halden Residences, beranda">
          <span className="font-display text-[1.375rem] leading-none">Halden</span>
          <Label className="opacity-70">Residences</Label>
        </Link>

        <nav aria-label="Utama" className="hidden items-center gap-10 md:flex">
          <NavLinks variant="bar" />
          <ViewingTrigger tone="context" size="sm">
            Jadwalkan survei
          </ViewingTrigger>
        </nav>

        <button
          type="button"
          className="text-[0.8125rem] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Tutup" : "Menu"}
        </button>
      </Container>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            className="fixed inset-x-0 top-nav bottom-0 border-t border-stone bg-paper text-ink md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE_HALDEN }}
          >
            <Container className="flex h-full flex-col justify-between py-10">
              <nav aria-label="Utama">
                <NavLinks variant="panel" onNavigate={close} />
              </nav>
              <ViewingTrigger onBeforeOpen={close} tone="ink" className="w-full">
                Jadwalkan survei
              </ViewingTrigger>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
