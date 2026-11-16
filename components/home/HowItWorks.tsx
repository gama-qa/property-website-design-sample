import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { DrawLine, RevealText, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/Reveal";
import { properties } from "@/src/data/properties";
import { site } from "@/src/data/site";

const steps = [
  {
    title: "Pilih dan bandingkan",
    text: `Setiap listing mencantumkan sewa per bulan, deposit, minimum sewa, dan utilitas yang termasuk, sehingga ${properties.length} hunian yang kami tawarkan bisa dibandingkan sebelum Anda menghubungi kami.`,
  },
  {
    title: "Jadwalkan survei",
    text: `Survei berlangsung ${site.viewingDays} dengan janji temu, sekitar ${site.viewingLengthMinutes} menit; pilih tanggal di halaman listing dan kami konfirmasi jamnya lewat telepon atau email.`,
  },
  {
    title: "Tanda tangan dan pindah",
    text: "Siapkan KTP, atau paspor dan KITAS, bayar deposit dan sewa periode pertama, lalu tanda tangani perjanjian; serah terima dengan daftar inventaris tertulis biasanya menyusul dalam 7 sampai 10 hari.",
  },
];

/**
 * Three numbered steps as a ruled list: large numeral, title, one sentence.
 * No cards, no icons. Each rule draws itself, then the row's three parts
 * arrive one after another.
 */
export function HowItWorks() {
  return (
    <section className="pt-28 pb-24 md:pt-40 md:pb-32">
      <Container>
        <Reveal>
          <Label className="text-ink/60">Cara kerja</Label>
        </Reveal>
        <Heading size="lg" className="mt-5 max-w-[20ch]">
          <RevealText text="Dari survei pertama sampai serah terima" delay={0.1} />
        </Heading>

        <ol className="mt-14 md:mt-20">
          {steps.map((step, i) => (
            <li key={step.title}>
              <DrawLine />
              <Stagger
                className="grid gap-x-10 gap-y-4 py-9 md:grid-cols-12 md:items-baseline md:py-12"
                stagger={0.12}
                delay={0.15}
              >
                {/* Inter, not the display face: its digits have uneven widths and would not line up down the list. */}
                <StaggerItem
                  as="span"
                  className="block text-[clamp(3.25rem,7vw,5.5rem)] leading-[0.85] font-light tracking-[-0.03em] text-ink/30 tabular-nums md:col-span-2"
                >
                  <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                </StaggerItem>
                <StaggerItem className="md:col-span-4">
                  <Heading level={3} size="md">
                    {step.title}
                  </Heading>
                </StaggerItem>
                <StaggerItem as="p" className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink/75 md:col-span-6">
                  {step.text}
                </StaggerItem>
              </Stagger>
              {i === steps.length - 1 ? <DrawLine /> : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
