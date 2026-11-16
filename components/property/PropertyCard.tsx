import Image from "next/image";
import Link from "next/link";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { ImageReveal } from "@/components/ui/motion-primitives";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";
import { cn } from "@/lib/cn";
import { formatDate, formatIDR } from "@/lib/format";
import { TYPE_LABEL, type Property } from "@/src/data/properties";

const GRID_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

type Props = {
  property: Property;
  priority?: boolean;
  /**
   * "listing": grid card (bedrooms, size, rent, availability).
   * "featured": home page card (area, size, rent), no availability line.
   */
  variant?: "listing" | "featured";
  /** `sizes` for the photograph; pass the real rendered width so it stays sharp. */
  sizes?: string;
  /** Tailwind aspect class for the photograph. */
  aspect?: string;
  headingSize?: "sm" | "md";
  /** 2 when the card sits directly under the page title, 3 under a section heading. */
  headingLevel?: 2 | 3;
  /** Uncover the photograph with a wipe when it scrolls into view. */
  revealImage?: boolean;
  className?: string;
};

/**
 * Property card: photograph, name, three figures. On hover the photograph
 * crossfades to the listing's second image, when it has one.
 */
export function PropertyCard({
  property: p,
  priority = false,
  variant = "listing",
  sizes = GRID_SIZES,
  aspect = "aspect-[4/3]",
  headingSize = "sm",
  headingLevel = 2,
  revealImage = false,
  className,
}: Props) {
  const [first, second] = p.images;
  const type = TYPE_LABEL[p.type];

  const photo = (
    <div className={cn("relative overflow-hidden bg-stone", aspect)}>
      <Image src={first.src} alt={first.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      {second ? (
        <Image
          src={second.src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="object-cover opacity-0 transition-opacity duration-1000 ease-halden group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      ) : null}
      {p.hasWalkthrough ? (
        <Label className="absolute top-0 left-0 bg-paper px-2.5 py-2 text-ink">Tur ruang</Label>
      ) : null}
    </div>
  );

  // Detail pages are static, so prefetching the whole page is cheap and makes the click instant.
  return (
    <Link href={`/properties/${p.slug}`} prefetch className={cn("group block", className)}>
      {revealImage ? <ImageReveal>{photo}</ImageReveal> : photo}

      <Heading level={headingLevel} size={headingSize} className="mt-5">
        <span className="relative inline pb-0.5">
          {p.name}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px origin-right scale-x-0 bg-current transition-transform duration-700 ease-halden group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100"
          />
        </span>
      </Heading>
      <p className="mt-1.5 text-[0.8125rem] text-ink/60">
        {variant === "featured" ? `${type} · ${p.bedrooms} kamar tidur` : `${p.area} · ${type}`}
      </p>

      <SpecList className="mt-4 border-t border-stone">
        {variant === "featured" ? (
          <SpecRow label="Area" value={p.area} className="py-2.5" />
        ) : (
          <SpecRow label="Kamar tidur" value={p.bedrooms} className="py-2.5" />
        )}
        <SpecRow label="Luas" value={p.sizeM2} note="m²" className="py-2.5" />
        <SpecRow label="Per bulan" value={formatIDR(p.pricePerMonth)} className="py-2.5" />
      </SpecList>

      {variant === "listing" ? (
        <p className="mt-4 flex items-center gap-2 text-[0.75rem] text-ink/70">
          <span aria-hidden className="size-1.5 bg-moss" />
          <span className="tabular-nums">Tersedia mulai {formatDate(p.availability)}</span>
        </p>
      ) : null}
    </Link>
  );
}
