"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { ensureGsap, ScrollTrigger } from "@/lib/gsap";

type NavHeroProps = ComponentPropsWithoutRef<"section"> & {
  /**
   * Scroll position (px from the top of the document) at which the navbar
   * turns solid. Defaults to the hero's bottom edge reaching the navbar.
   */
  solidAt?: (section: HTMLElement) => number;
};

/**
 * Wrap a page's top hero (e.g. the walkthrough) with this. While it is still
 * behind the navbar, the navbar stays transparent (see the `over-hero`
 * variant in globals.css). Unmounting removes the marker, so route changes
 * need no extra handling.
 */
export function NavHero({ children, solidAt, ...props }: NavHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const solidAtRef = useRef(solidAt);

  useEffect(() => {
    solidAtRef.current = solidAt;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensureGsap();

    const navHeight = () =>
      document.querySelector<HTMLElement>("[data-site-nav]")?.offsetHeight ?? 72;

    const set = (active: boolean) => {
      el.dataset.navHero = active ? "active" : "passed";
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: 0,
      end: () =>
        solidAtRef.current
          ? solidAtRef.current(el)
          : el.getBoundingClientRect().bottom + window.scrollY - navHeight(),
      invalidateOnRefresh: true,
      onUpdate: (self) => set(self.progress < 1),
      onRefresh: (self) => set(self.progress < 1),
    });
    set(st.progress < 1);

    return () => {
      st.kill();
      // With cacheComponents, Next keeps the previous page in the DOM, hidden,
      // instead of removing it. Its hero must stop counting as "under the
      // navbar", or the navbar stays transparent on every page visited next.
      // (This cleanup runs when the page is hidden; the effect runs again when
      // it is shown.)
      el.dataset.navHero = "passed";
    };
  }, []);

  return (
    <section ref={ref} data-nav-hero="active" {...props}>
      {children}
    </section>
  );
}
