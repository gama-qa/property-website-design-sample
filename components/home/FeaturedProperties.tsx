import { PropertyCard } from "@/components/property/PropertyCard";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { DrawLine, RevealText } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/Reveal";
import { getProperty, properties, type Property } from "@/src/data/properties";
import { featuredSlugs } from "@/src/data/site";

/**
 * Three listings in an asymmetric layout: one large card on the left, two
 * smaller ones on the right, the first of them dropped lower so the three
 * photographs do not share a top edge. Each photograph is uncovered with a
 * wipe; the text below it follows.
 */
export function FeaturedProperties() {
  const [lead, ...rest] = featuredSlugs.map((slug) => getProperty(slug)).filter((p): p is Property => Boolean(p));
  if (!lead) return null;

  return (
    <section className="pb-24 md:pb-32">
      <Container>
        <DrawLine />
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6 pt-24 md:pt-32">
          <div>
            <Reveal>
              <Label className="text-ink/60">Properti pilihan</Label>
            </Reveal>
            <Heading size="lg" className="mt-5 max-w-[16ch]">
              <RevealText text="Tiga hunian yang siap disurvei" delay={0.1} />
            </Heading>
          </div>
          <Reveal delay={0.3}>
            <AnimatedLink href="/properties" className="text-[0.8125rem] tabular-nums">
              Semua {properties.length} listing
            </AnimatedLink>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-16 md:mt-20 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <PropertyCard
              property={lead}
              variant="featured"
              headingLevel={3}
              headingSize="md"
              revealImage
              // Taller on desktop so the large card balances the two stacked ones.
              aspect="aspect-[4/3] lg:aspect-square"
              sizes="(min-width: 1440px) 760px, (min-width: 1024px) 56vw, 100vw"
            />
          </Reveal>

          <div className="grid gap-16 sm:grid-cols-2 sm:gap-x-8 lg:col-span-4 lg:col-start-9 lg:grid-cols-1 lg:pt-20">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={0.1 + i * 0.1}>
                <PropertyCard
                  property={p}
                  variant="featured"
                  headingLevel={3}
                  revealImage
                  sizes="(min-width: 1440px) 440px, (min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
