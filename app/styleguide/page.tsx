import type { Metadata } from "next";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "paper", hex: "#F6F3EE", className: "bg-paper" },
  { name: "stone", hex: "#D9D2C7", className: "bg-stone" },
  { name: "ink", hex: "#1F1E1C", className: "bg-ink" },
  { name: "moss", hex: "#2F4A3C", className: "bg-moss" },
];

/** Internal reference for tokens and base components. Not linked from the site. */
export default function StyleguidePage() {
  return (
    <div className="pt-[calc(var(--spacing-nav)+4rem)] pb-32">
      <Container className="grid gap-24">
        <section>
          <Label className="text-ink/60">Warna</Label>
          <div className="mt-6 grid grid-cols-2 border-t border-l border-stone md:grid-cols-4">
            {swatches.map((s) => (
              <div key={s.name} className="border-r border-b border-stone p-4">
                <div className={`aspect-[4/3] border border-stone ${s.className}`} />
                <p className="mt-3 text-[0.8125rem]">{s.name}</p>
                <p className="text-[0.8125rem] text-ink/60 tabular-nums">{s.hex}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <Label className="text-ink/60">Tipografi</Label>
          <div className="mt-6 grid gap-6">
            <Heading level={2} size="display">Dapur, lantai dasar</Heading>
            <Heading level={2} size="xl">Dapur, lantai dasar</Heading>
            <Heading level={2} size="lg">Dapur, lantai dasar</Heading>
            <Heading level={2} size="md">Dapur, lantai dasar</Heading>
            <Heading level={2} size="sm">Dapur, lantai dasar</Heading>
            <p className="max-w-[60ch] text-[0.9375rem] leading-relaxed">
              Inter untuk teks antarmuka dan data. Angka spesifikasi memakai angka tabular: 1.234 / 98,5 m² / Rp
              45.000.000.
            </p>
          </div>
        </section>

        <section>
          <Label className="text-ink/60">Tombol dan tautan</Label>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button>Ajukan survei</Button>
            <Button size="sm">Jadwalkan survei</Button>
            <Button tone="moss" size="sm">Tersedia</Button>
            <Button disabled>Nonaktif</Button>
            <AnimatedLink href="/styleguide" className="text-[0.8125rem]">
              Tautan beranimasi
            </AnimatedLink>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 bg-ink p-8">
            <Button tone="paper">Ajukan survei</Button>
            <Button tone="paper" size="sm">Jadwalkan survei</Button>
          </div>
        </section>

        <section className="grid gap-12 md:grid-cols-2">
          <div>
            <Label className="text-ink/60">SpecRow di atas paper (nilai contoh)</Label>
            <SpecList className="mt-6 border-t border-stone">
              <SpecRow label="Luas unit" value="142" note="m²" />
              <SpecRow label="Lantai" value="12 dari 28" />
              <SpecRow label="Arah hadap" value="Timur Laut" />
              <SpecRow label="Deposit" value="2 bulan sewa" />
            </SpecList>
          </div>
          <div className="bg-ink p-8 text-paper">
            <Label className="text-paper/60">SpecRow di atas ink</Label>
            <SpecList className="mt-6 border-t border-paper/20">
              <SpecRow tone="paper" label="Sewa per bulan" value="Rp 45.000.000" />
              <SpecRow tone="paper" label="Minimum sewa" value="12 bulan" />
            </SpecList>
          </div>
        </section>
      </Container>
    </div>
  );
}
