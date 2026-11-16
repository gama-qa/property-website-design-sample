"use client";

import { createContext, useCallback, useContext, useId, useMemo, useState, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { formatIDR } from "@/lib/format";
import { properties } from "@/src/data/properties";
import { site } from "@/src/data/site";
import { ViewingForm, type PropertyOption } from "./ViewingForm";

type ViewingModalContext = {
  /** Open the "Jadwalkan survei" modal, optionally with a property preselected. */
  open: (slug?: string) => void;
};

const Context = createContext<ViewingModalContext>({ open: () => {} });

export function useViewingModal() {
  return useContext(Context);
}

const OPTIONS: PropertyOption[] = properties.map((p) => ({
  slug: p.slug,
  name: p.name,
  detail: `${formatIDR(p.pricePerMonth)} per bulan`,
}));

/**
 * Provides the site-wide "Jadwalkan survei" modal. Any button can open it
 * through useViewingModal() or <ViewingTrigger>.
 */
export function ViewingModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; slug?: string }>({ open: false });
  const titleId = useId();

  const open = useCallback((slug?: string) => setState({ open: true, slug }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <Context.Provider value={value}>
      {children}
      <Dialog open={state.open} onClose={close} labelledBy={titleId}>
        <div className="px-5 pt-6 pb-10 sm:px-10 sm:pt-8 sm:pb-12">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Label className="text-ink/60">Survei</Label>
              <Heading id={titleId} level={2} size="lg" className="mt-4">
                Jadwalkan survei
              </Heading>
            </div>
            <button
              type="button"
              onClick={close}
              className="shrink-0 border border-ink/25 px-4 py-2 text-[0.75rem] transition-colors duration-300 ease-halden hover:border-ink hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper"
            >
              Tutup
            </button>
          </div>
          <p className="mt-5 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink/70">
            Survei berlangsung {site.viewingDays} dengan janji temu, sekitar {site.viewingLengthMinutes} menit. Pilih
            properti dan tanggalnya; jamnya kami konfirmasi lewat telepon atau email.
          </p>
          <div className="mt-9 border-t border-stone pt-9">
            <ViewingForm options={OPTIONS} initialSlug={state.slug} />
          </div>
        </div>
      </Dialog>
    </Context.Provider>
  );
}

type TriggerProps = Omit<Extract<ButtonProps, { href?: undefined }>, "onClick" | "type"> & {
  /** Preselect this property in the modal. */
  slug?: string;
  /** Runs before the modal opens (e.g. close a menu). */
  onBeforeOpen?: () => void;
};

/** A button that opens the "Jadwalkan survei" modal. */
export function ViewingTrigger({ slug, onBeforeOpen, children, ...button }: TriggerProps) {
  const { open } = useViewingModal();
  return (
    <Button
      {...button}
      onClick={() => {
        onBeforeOpen?.();
        open(slug);
      }}
    >
      {children}
    </Button>
  );
}
