"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/providers/LenisProvider";
import { EASE_HALDEN } from "@/lib/motion";

/** If the route has not changed this long after the wipe covered the screen, uncover anyway. */
const STUCK_MS = 5000;

/** Reports route changes. usePathname needs a Suspense boundary under cacheComponents. */
function PathWatcher({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  });
  useEffect(() => {
    callback.current(pathname);
  }, [pathname]);
  return null;
}

/**
 * Page transition: a warm-white panel rises to cover the page, the route
 * changes underneath, then the panel continues upward and uncovers the new
 * page.
 *
 * The App Router unmounts the old page as soon as navigation starts, so an
 * exit animation on the page itself is not possible. Instead, clicks on
 * internal links are held back until the panel has covered the screen.
 * Modified clicks, new-tab links, downloads, other origins and same-page
 * links (hash, query) are left alone. Back/forward navigate without a wipe.
 */
export function PageTransition() {
  const router = useRouter();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [covering, setCovering] = useState(false);
  const pending = useRef<string | null>(null);
  const pushed = useRef(false);
  const stuck = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.href) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;

      // Next's <Link> skips its own navigation when the event is already prevented.
      e.preventDefault();
      if (pending.current) return;
      pending.current = url.pathname + url.search + url.hash;
      pushed.current = false;
      setCovering(true);
    };
    // Capture phase on the document, so this runs before React's handlers.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const uncover = () => {
    if (stuck.current) clearTimeout(stuck.current);
    stuck.current = null;
    pending.current = null;
    pushed.current = false;
    setCovering(false);
  };

  const onCovered = () => {
    const href = pending.current;
    if (!href || pushed.current) return;
    pushed.current = true;
    router.push(href);
    stuck.current = setTimeout(uncover, STUCK_MS);
  };

  const onRouteChange = () => {
    if (!pushed.current) return;
    // The new page starts at the top; tell Lenis so it does not ease from the old position.
    lenis?.scrollTo(0, { immediate: true, force: true });
    uncover();
  };

  return (
    <>
      <Suspense fallback={null}>
        <PathWatcher onChange={onRouteChange} />
      </Suspense>
      <AnimatePresence>
        {covering ? (
          <motion.div
            key="page-wipe"
            aria-hidden
            className="fixed inset-0 z-[90] bg-paper"
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            exit={reduced ? { opacity: 0 } : { y: "-100%" }}
            transition={{ duration: reduced ? 0.25 : 0.75, ease: EASE_HALDEN }}
            onAnimationComplete={onCovered}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
