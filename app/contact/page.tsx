import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ViewingTrigger } from "@/components/property/ViewingModal";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { DrawLine, RevealText, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";
import { site } from "@/src/data/site";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Alamat kantor, jam operasional, dan formulir pesan Halden Residences.",
};

const linkClass = "underline decoration-ink/25 underline-offset-4 transition-colors duration-300 hover:decoration-ink";

export default function ContactPage() {
  return (
    <Container className="pt-[calc(var(--spacing-nav)+5rem)] pb-28 md:pb-36">
      <header className="pb-14 md:pb-20">
        <Reveal>
          <Label className="text-ink/60">Kontak</Label>
        </Reveal>
        <Heading level={1} size="xl" className="mt-5 max-w-[16ch]">
          <RevealText text="Hubungi kami" delay={0.1} />
        </Heading>
        <Reveal delay={0.3}>
          <p className="mt-6 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink/70">
            Untuk pertanyaan umum, tulis pesan di formulir. Untuk melihat hunian, langsung jadwalkan survei: tanggalnya
            Anda pilih sendiri.
          </p>
        </Reveal>
      </header>

      <DrawLine />
      <div className="grid gap-x-10 gap-y-16 pt-14 md:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Heading size="sm">
            <RevealText text="Kantor" />
          </Heading>
          <Stagger className="mt-6" stagger={0.1} delay={0.1}>
            <StaggerItem>
              <address className="text-[0.9375rem] leading-relaxed not-italic">
                {site.name}
                {site.officeLines.map((line) => (
                  <span key={line} className="block text-ink/70">
                    {line}
                  </span>
                ))}
              </address>
            </StaggerItem>
            <StaggerItem className="mt-8">
              <SpecList className="border-t border-stone">
                <SpecRow label="Jam operasional" value={site.hours} />
                <SpecRow label="Tutup" value={site.closed} />
                <SpecRow
                  label="Telepon"
                  value={
                    <a href={site.phoneHref} className={linkClass}>
                      {site.phone}
                    </a>
                  }
                />
                <SpecRow
                  label="Email"
                  value={
                    <a href={`mailto:${site.email}`} className={`break-all ${linkClass}`}>
                      {site.email}
                    </a>
                  }
                />
              </SpecList>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-4 text-[0.75rem] leading-relaxed text-ink/55">
                Situs contoh: alamat dan kontak ini fiktif dan tidak terhubung ke siapa pun.
              </p>
            </StaggerItem>
            <StaggerItem className="mt-10">
              <ViewingTrigger tone="moss" size="sm">
                Jadwalkan survei
              </ViewingTrigger>
            </StaggerItem>
          </Stagger>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Heading size="sm">
            <RevealText text="Kirim pesan" />
          </Heading>
          <Reveal className="mt-6" delay={0.15}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
