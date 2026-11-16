import type { Area, Property, PropertyType } from "@/src/data/properties";

export const PRICE_BANDS = [
  { id: "all", label: "Semua harga", min: 0, max: Infinity },
  { id: "under-30", label: "Hingga Rp 30 juta", min: 0, max: 30_000_000 },
  { id: "30-60", label: "Rp 30 sampai 60 juta", min: 30_000_001, max: 60_000_000 },
  { id: "over-60", label: "Di atas Rp 60 juta", min: 60_000_001, max: Infinity },
] as const;

export type PriceBand = (typeof PRICE_BANDS)[number]["id"];

export const BEDROOM_OPTIONS = [0, 1, 2, 3, 4] as const;
export type MinBedrooms = (typeof BEDROOM_OPTIONS)[number];

export type Filters = {
  area: Area | "all";
  type: PropertyType | "all";
  /** Minimum number of bedrooms; 0 = any. */
  beds: MinBedrooms;
  price: PriceBand;
};

export const DEFAULT_FILTERS: Filters = { area: "all", type: "all", beds: 0, price: "all" };

export type FilterKey = keyof Filters;

export const FILTER_NAMES: Record<FilterKey, string> = {
  area: "area",
  type: "tipe",
  beds: "kamar tidur",
  price: "harga",
};

/** Read filters from the URL, ignoring anything that is not a known value. */
export function parseFilters(params: URLSearchParams, areas: readonly Area[]): Filters {
  const area = params.get("area");
  const type = params.get("type");
  const beds = Number(params.get("beds"));
  const price = params.get("price");
  return {
    area: areas.includes(area as Area) ? (area as Area) : "all",
    type: type === "apartment" || type === "house" ? type : "all",
    beds: (BEDROOM_OPTIONS as readonly number[]).includes(beds) ? (beds as MinBedrooms) : 0,
    price: PRICE_BANDS.some((b) => b.id === price) ? (price as PriceBand) : "all",
  };
}

/** Query string for the given filters; defaults are left out. */
export function toQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.area !== "all") params.set("area", filters.area);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.beds !== 0) params.set("beds", String(filters.beds));
  if (filters.price !== "all") params.set("price", filters.price);
  return params.toString();
}

export function applyFilters(list: Property[], filters: Filters) {
  const band = PRICE_BANDS.find((b) => b.id === filters.price) ?? PRICE_BANDS[0];
  return list.filter(
    (p) =>
      (filters.area === "all" || p.area === filters.area) &&
      (filters.type === "all" || p.type === filters.type) &&
      p.bedrooms >= filters.beds &&
      p.pricePerMonth >= band.min &&
      p.pricePerMonth <= band.max,
  );
}

export function activeKeys(filters: Filters): FilterKey[] {
  return (Object.keys(DEFAULT_FILTERS) as FilterKey[]).filter((k) => filters[k] !== DEFAULT_FILTERS[k]);
}

/**
 * For an empty result: how many listings each single filter is hiding.
 * Only filters whose removal would show something are returned.
 */
export function relaxations(list: Property[], filters: Filters) {
  return activeKeys(filters)
    .map((key) => {
      const relaxed = { ...filters, [key]: DEFAULT_FILTERS[key] } as Filters;
      return { key, relaxed, count: applyFilters(list, relaxed).length };
    })
    .filter((r) => r.count > 0);
}
