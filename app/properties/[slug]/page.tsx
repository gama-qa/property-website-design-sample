import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyCarousel } from "@/components/property/PropertyCarousel";
import { ViewingForm } from "@/components/property/ViewingForm";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { DrawLine, RevealText, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";
import { Walkthrough } from "@/components/walkthrough/Walkthrough";
import { formatDate, formatDistance, formatIDR } from "@/lib/format";
import { getProperty, properties, TYPE_LABEL, type Property } from "@/src/data/properties";
import { site } from "@/src/data/site";

/** Every listing is prerendered; any other slug renders the not-found page (see notFound below). */
export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

/** Same type first, then closest rent. */
function similarTo(p: Property, count = 3) {
  return properties
    .filter((o) => o.slug !== p.slug)
    .sort(
      (a, b) =>
        Number(a.type !== p.type) - Number(b.type !== p.type) ||
        Math.abs(a.pricePerMonth - p.pricePerMonth) - Math.abs(b.pricePerMonth - p.pricePerMonth),
    )
    .slice(0, count);
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return { title: "Properti tidak ditemukan" };
  return {
    title: p.name,
    description: `${TYPE_LABEL[p.type]} disewakan di ${p.area}: ${p.bedrooms} kamar tidur, ${p.sizeM2} m², ${formatIDR(p.pricePerMonth)} per bulan.`,
  };
}

/**
 * The page itself does not read `params`: with partial prefetching the shell of
 * this route is shared by every listing link, so the URL-specific part lives in
 * a child behind Suspense. Each slug from generateStaticParams is still
 * prerendered in full.
 */
export default function PropertyPage({ params }: PageProps<"/properties/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" aria-busy="true" />}>
      <PropertyDetail params={params} />
    </Suspense>
  );
}

async function PropertyDetail({ params }: Pick<PageProps<"/properties/[slug]">, "params">) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();

  const eyebrow = `${TYPE_LABEL[p.type]} disewakan · ${p.area}`;
  // Unique per listing: Next keeps previously visited pages in the DOM (hidden),
  // so a shared id like "viewing" would exist more than once.
  const formId = `survei-${p.slug}`;
  const similar = similarTo(p);
  const withWalkthrough = Boolean(p.hasWalkthrough && p.walkthroughId);

  return (
    <>
      {withWalkthrough && p.walkthroughId ? (
        // Same component as the home page; WebGL lives only inside it.
        <Walkthrough
          clipIds={[p.walkthroughId]}
          title={p.name}
          eyebrow={eyebrow}
          sentence={`${p.address}. Gulir untuk menyusuri ruangannya, atau lanjut ke bawah untuk rinciannya.`}
          titleSize="page"
          compact
        />
      ) : (
        <Container className="pt-[calc(var(--spacing-nav)+3rem)]">
          <AnimatedLink href="/properties" className="text-[0.8125rem] text-ink/60">
            Semua properti
          </AnimatedLink>
          <header className="mt-10 pb-10">
            <Label className="text-ink/60">{eyebrow}</Label>
            <Heading level={1} size="xl" className="mt-5 max-w-[18ch]">
              {p.name}
            </Heading>
            <p className="mt-4 text-[0.9375rem] text-ink/60">{p.address}</p>
          </header>
          <PropertyCarousel images={p.images} priority />
        </Container>
      )}

      <Container className="py-20 md:py-28">
        <div className="grid gap-x-10 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <Label className="text-ink/60">Tentang hunian ini</Label>
              <p className="mt-6 max-w-[40ch] text-[1.3125rem] leading-[1.5] text-pretty md:text-[1.4375rem]">
                {p.description}
              </p>
            </Reveal>

            <div className="mt-20">
              <Heading size="sm">
                <RevealText text="Fasilitas" />
              </Heading>
              <DrawLine className="mt-6" />
              <Stagger as="ul" className="grid sm:grid-cols-2 sm:gap-x-10" stagger={0.06}>
                {p.amenities.map((a) => (
                  <StaggerItem as="li" key={a} className="border-b border-stone py-3.5 text-[0.9375rem] leading-snug">
                    {a}
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            <div className="mt-20">
              <Heading size="sm">
                <RevealText text="Sekitar lokasi" />
              </Heading>
              <DrawLine className="mt-6" />
              <Stagger stagger={0.08}>
                {p.nearby.map((n) => (
                  <StaggerItem key={n.name}>
                    <SpecList>
                      <SpecRow label={n.name} value={formatDistance(n.distanceKm)} note="km" />
                    </SpecList>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>

          <aside className="max-lg:order-first lg:col-span-4 lg:col-start-9">
            <Reveal className="lg:sticky lg:top-[calc(var(--spacing-nav)+2rem)]">
              <Label className="text-ink/60">Sewa per bulan</Label>
              <p className="mt-4 text-[2rem] leading-none font-medium tracking-[-0.01em] tabular-nums">
                {formatIDR(p.pricePerMonth)}
              </p>
              <p className="mt-3 text-[0.8125rem] text-ink/60 tabular-nums">
                {p.bedrooms} kamar tidur · {p.bathrooms} kamar mandi
              </p>

              <SpecList className="mt-8 border-t border-stone">
                <SpecRow label={p.type === "house" ? "Luas bangunan" : "Luas unit"} value={p.sizeM2} note="m²" />
                <SpecRow label="Lantai" value={p.floor} />
                <SpecRow label="Arah hadap" value={p.orientation} />
                <SpecRow label="Perabot" value={p.furnishing} />
                <SpecRow label="Minimum sewa" value={`${p.minimumLease} bulan`} />
                <SpecRow label="Deposit" value={`${p.deposit} bulan sewa`} />
                <SpecRow
                  label="Utilitas termasuk"
                  value={p.utilitiesIncluded.length > 0 ? p.utilitiesIncluded.join(", ") : "Tidak ada, semua bermeter"}
                />
                <SpecRow label="Tersedia mulai" value={formatDate(p.availability)} />
              </SpecList>

              <Button href={`#${formId}`} tone="moss" className="mt-8 w-full">
                Ajukan survei
              </Button>
            </Reveal>
          </aside>
        </div>
      </Container>

      {/* Listings with a walkthrough open with footage, so their photographs get their own section. */}
      {withWalkthrough && p.images.length > 0 ? (
        <section>
          <Container className="pb-20 md:pb-28">
            <DrawLine />
            <div className="pt-20 md:pt-28">
              <Heading size="md">
                <RevealText text="Foto" />
              </Heading>
              <Reveal className="mt-10" delay={0.1}>
                <PropertyCarousel images={p.images} />
              </Reveal>
            </div>
          </Container>
        </section>
      ) : null}

      <section id={formId} className="scroll-mt-nav">
        <Container>
          <DrawLine />
          <div className="grid gap-x-10 gap-y-12 py-20 md:py-28 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Heading size="lg">
                <RevealText text="Ajukan survei" />
              </Heading>
              <Reveal delay={0.15}>
                <p className="mt-6 max-w-[36ch] text-[0.9375rem] leading-relaxed text-ink/70">
                  Survei dilakukan dengan janji temu, {site.viewingDays}. Sebutkan hari yang Anda inginkan dan kami akan
                  mengonfirmasi jamnya untuk {p.name}.
                </p>
              </Reveal>
            </div>
            <Reveal className="lg:col-span-7 lg:col-start-6" delay={0.1}>
              <ViewingForm slug={p.slug} propertyName={p.name} />
            </Reveal>
          </div>
        </Container>
      </section>

      <section>
        <Container className="pb-20 md:pb-28">
          <DrawLine />
          <div className="flex items-baseline justify-between gap-6 pt-20 md:pt-28">
            <Heading size="md">
              <RevealText text="Properti serupa" />
            </Heading>
            <Reveal delay={0.2}>
              <AnimatedLink href="/properties" className="text-[0.8125rem]">
                Semua properti
              </AnimatedLink>
            </Reveal>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
            {similar.map((s, i) => (
              <li key={s.slug}>
                <Reveal delay={i * 0.09}>
                  <PropertyCard property={s} headingLevel={3} revealImage />
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
