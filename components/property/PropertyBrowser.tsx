"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";
import { EASE_HALDEN } from "@/lib/motion";
import {
  activeKeys,
  applyFilters,
  BEDROOM_OPTIONS,
  DEFAULT_FILTERS,
  FILTER_NAMES,
  parseFilters,
  PRICE_BANDS,
  relaxations,
  toQuery,
  type Filters,
} from "@/lib/property-filters";
import type { Area, Property } from "@/src/data/properties";
import { FilterSegmented, FilterSelect } from "./FilterControls";
import { PropertyCard } from "./PropertyCard";

type ViewProps = {
  properties: Property[];
  areas: Area[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

const TYPE_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "apartment", label: "Apartemen" },
  { value: "house", label: "Rumah" },
] as const;

const BED_OPTIONS = BEDROOM_OPTIONS.map((n) => ({ value: n, label: n === 0 ? "Semua" : `${n}+` }));
const PRICE_OPTIONS = PRICE_BANDS.map((b) => ({ value: b.id, label: b.label }));

const plural = (n: number) => `${n} listing`;

function BrowserView({ properties, areas, filters, onChange }: ViewProps) {
  const results = useMemo(() => applyFilters(properties, filters), [properties, filters]);
  const active = activeKeys(filters);
  const areaOptions = useMemo(
    () => [{ value: "all" as const, label: "Semua area" }, ...areas.map((a) => ({ value: a, label: a }))],
    [areas],
  );
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  return (
    <MotionConfig reducedMotion="user">
      <div className="border-y border-stone py-6">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
          <FilterSelect label="Area" value={filters.area} options={areaOptions} onChange={(v) => set("area", v)} />
          <FilterSegmented label="Tipe" value={filters.type} options={TYPE_OPTIONS} onChange={(v) => set("type", v)} />
          <FilterSegmented label="Kamar tidur" value={filters.beds} options={BED_OPTIONS} onChange={(v) => set("beds", v)} />
          <FilterSelect label="Sewa per bulan" value={filters.price} options={PRICE_OPTIONS} onChange={(v) => set("price", v)} />

          <div className="ml-auto flex h-9 items-center gap-6 text-[0.8125rem]">
            {active.length > 0 ? (
              <button
                type="button"
                onClick={() => onChange(DEFAULT_FILTERS)}
                className="text-ink/60 underline decoration-ink/30 underline-offset-4 transition-colors duration-300 hover:text-ink hover:decoration-ink"
              >
                Hapus filter
              </button>
            ) : null}
            <p className="tabular-nums" aria-live="polite">
              {results.length === properties.length
                ? plural(properties.length)
                : `${results.length} dari ${plural(properties.length)}`}
            </p>
          </div>
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="relative mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
          <AnimatePresence mode="popLayout">
            {results.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.35, ease: EASE_HALDEN } }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 1.1,
                  ease: EASE_HALDEN,
                  delay: (i % 3) * 0.09,
                  layout: { duration: 0.9, ease: EASE_HALDEN },
                }}
              >
                <PropertyCard property={p} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyState properties={properties} filters={filters} onChange={onChange} />
      )}
    </MotionConfig>
  );
}

function EmptyState({ properties, filters, onChange }: Omit<ViewProps, "areas">) {
  const options = relaxations(properties, filters);
  return (
    <motion.div
      className="mt-12 max-w-[44rem] pb-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE_HALDEN }}
    >
      <Heading level={2} size="md">
        Tidak ada listing yang cocok dengan filter ini.
      </Heading>
      <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink/70">
        Saat ini ada {plural(properties.length)}, dan tidak satu pun sesuai dengan kombinasi ini.
        {options.length > 0 ? " Melepas satu filter akan menampilkan:" : " Hapus filter untuk melihat semuanya."}
      </p>

      {options.length > 0 ? (
        <ul className="mt-6 border-t border-stone">
          {options.map((o) => (
            <li key={o.key} className="border-b border-stone">
              <button
                type="button"
                onClick={() => onChange(o.relaxed)}
                className="group flex w-full items-baseline justify-between gap-6 py-3.5 text-left text-[0.9375rem]"
              >
                <span className="underline decoration-transparent underline-offset-4 transition-colors duration-300 group-hover:decoration-ink">
                  Tanpa filter {FILTER_NAMES[o.key]}
                </span>
                <span className="text-ink/60 tabular-nums">{plural(o.count)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Button className="mt-8" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}>
        Hapus semua filter
      </Button>
    </motion.div>
  );
}

/** Filters live in the URL, so a filtered view can be shared and survives reload. */
function Connected({ properties, areas }: Pick<ViewProps, "properties" | "areas">) {
  const params = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString()), areas), [params, areas]);

  const onChange = (next: Filters) => {
    const query = toQuery(next);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  return <BrowserView properties={properties} areas={areas} filters={filters} onChange={onChange} />;
}

/**
 * Listing grid with filters. Reading the URL needs a Suspense boundary under
 * cacheComponents; the fallback is the same grid unfiltered, so the server
 * HTML already contains every listing.
 */
export function PropertyBrowser({ properties }: { properties: Property[] }) {
  const areas = useMemo(() => [...new Set(properties.map((p) => p.area))].sort() as Area[], [properties]);
  return (
    <Suspense
      fallback={<BrowserView properties={properties} areas={areas} filters={DEFAULT_FILTERS} onChange={() => {}} />}
    >
      <Connected properties={properties} areas={areas} />
    </Suspense>
  );
}
