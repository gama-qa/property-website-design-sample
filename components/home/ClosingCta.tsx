import type { ReactNode } from "react";
import { ViewingTrigger } from "@/components/property/ViewingModal";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { DrawLine, RevealText, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";
import { site } from "@/src/data/site";

const linkClass = "underline decoration-ink/25 underline-offset-4 transition-colors duration-300 hover:decoration-ink";

/** Closing call to action: one sentence, one button, short contact details. */
export function ClosingCta() {
  const rows: { label: string; value: ReactNode }[] = [
    {
      label: "Telepon",
      value: (
        <a href={site.phoneHref} className={linkClass}>
          {site.phone}
        </a>
      ),
    },
    {
      label: "Email",
      value: (
        <a href={`mailto:${site.email}`} className={`break-all ${linkClass}`}>
          {site.email}
        </a>
      ),
    },
    { label: "Kantor", value: site.office },
    { label: "Jam buka", value: site.hours },
  ];

  return (
    <section className="pb-24 md:pb-36">
      <Container>
        <DrawLine />
        <div className="grid gap-x-10 gap-y-14 pt-24 md:pt-36 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Label className="text-ink/60">Survei</Label>
            </Reveal>
            <Heading size="xl" className="mt-5 max-w-[17ch]">
              <RevealText text="Lihat langsung huniannya sebelum memutuskan." delay={0.1} />
            </Heading>
            <Reveal delay={0.5}>
              <ViewingTrigger tone="moss" className="mt-10">
                Jadwalkan survei
              </ViewingTrigger>
            </Reveal>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <DrawLine delay={0.2} />
            {/* One list per row so each row can arrive on its own. */}
            <Stagger stagger={0.1} delay={0.3}>
              {rows.map((row) => (
                <StaggerItem key={row.label}>
                  <SpecList>
                    <SpecRow label={row.label} value={row.value} />
                  </SpecList>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.6}>
              <p className="mt-4 text-[0.75rem] leading-relaxed text-ink/55">
                Situs contoh: kontak ini fiktif dan tidak terhubung ke siapa pun.
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
