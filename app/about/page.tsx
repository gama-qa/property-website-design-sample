import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { ExpandingImage } from "@/components/about/ExpandingImage";
import { ScrollRevealText } from "@/components/about/ScrollRevealText";
import { StackedTopics, type Topic } from "@/components/about/StackedTopics";
import { VelocityMarquee } from "@/components/about/VelocityMarquee";
import { ViewingTrigger } from "@/components/property/ViewingModal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { DrawLine, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import { Reveal } from "@/components/ui/Reveal";
import { SpecList, SpecRow } from "@/components/ui/SpecRow";
import { properties } from "@/src/data/properties";
import { site } from "@/src/data/site";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Cara Halden Residences bekerja: apa yang diperiksa sebelum sebuah hunian ditawarkan, dan siapa yang dihubungi penyewa saat ada masalah.",
};

const inspection = [
  { item: "Listrik", check: "Daya PLN terpasang, MCB, dan semua stopkontak." },
  { item: "Air", check: "Tekanan di tiap keran, pompa, pemanas air, dan tanda kebocoran." },
  { item: "AC", check: "Tiap unit dinyalakan; tanggal servis terakhir dicatat." },
  { item: "Atap dan plafon", check: "Bekas rembesan, terutama setelah hujan." },
  { item: "Pintu, jendela, kunci", check: "Semuanya dibuka, ditutup, dan dikunci." },
  { item: "Perabot dan peralatan", check: "Dicocokkan satu per satu dengan daftar inventaris." },
];

const body = "max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink/75";
const linkClass = "underline decoration-ink/25 underline-offset-4 transition-colors duration-300 hover:decoration-ink";

const topics: Topic[] = [
  {
    number: "01",
    title: "Seleksi properti",
    content: (
      <Stagger stagger={0.12}>
        <StaggerItem as="p" className={body}>
          Kami mendatangi setiap hunian sebelum menawarkannya. Sebuah hunian masuk daftar hanya jika pemiliknya dapat
          menunjukkan bukti kepemilikan dan PBB tahun berjalan, bersedia memakai perjanjian sewa tertulis, dan
          mengizinkan inspeksi.
        </StaggerItem>
        <StaggerItem as="p" className={`mt-5 ${body}`}>
          Harga, deposit, minimum sewa, dan utilitas yang termasuk ditetapkan bersama pemilik sebelum listing tayang,
          lalu ditulis apa adanya di halaman listing. Angka di sana adalah angka di perjanjian.
        </StaggerItem>
      </Stagger>
    ),
  },
  {
    number: "02",
    title: "Standar inspeksi",
    content: (
      <>
        <Reveal>
          <p className={body}>
            Sebelum listing tayang, dan sekali lagi sebelum serah terima, kami memeriksa hal yang sama di setiap hunian:
          </p>
        </Reveal>
        <Stagger className="mt-6 border-t border-stone" stagger={0.07} delay={0.1}>
          {inspection.map((row) => (
            <StaggerItem key={row.item} className="grid gap-x-8 gap-y-1 border-b border-stone py-3 sm:grid-cols-[11rem_1fr]">
              <span className="text-[0.9375rem]">{row.item}</span>
              <span className="text-[0.9375rem] leading-relaxed text-ink/70">{row.check}</span>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.2}>
          <p className={`mt-6 ${body}`}>
            Hasilnya ditulis dalam laporan per ruang, dengan foto untuk setiap temuan, dan salinannya dilampirkan pada
            perjanjian sewa.
          </p>
        </Reveal>
      </>
    ),
  },
  {
    number: "03",
    title: "Saat ada masalah",
    content: (
      <>
        <Reveal>
          <p className={body}>
            Setiap sewa punya satu pengelola yang namanya tertulis di perjanjian. Dialah yang Anda hubungi, bukan
            pemilik hunian.
          </p>
        </Reveal>
        <Reveal className="mt-6" delay={0.1}>
          <SpecList className="border-t border-stone">
            <SpecRow
              label="Telepon penyewa"
              value={
                <a href={site.tenantPhoneHref} className={linkClass}>
                  {site.tenantPhone}
                </a>
              }
            />
            <SpecRow label="Jam kerja" value={site.hours} />
            <SpecRow label="Di luar jam kerja" value="Laporan dicatat, dijawab hari kerja berikutnya" />
          </SpecList>
        </Reveal>
        <Reveal delay={0.2}>
          <p className={`mt-6 ${body}`}>
            Kerusakan pada bangunan dan peralatan milik pemilik ditanggung pemilik; kerusakan akibat pemakaian
            ditanggung penyewa. Kami tidak menjanjikan waktu perbaikan tertentu, karena itu bergantung pada teknisi dan
            suku cadang. Yang kami sanggupi adalah mencatat laporan Anda dan mengabarkan perkembangannya.
          </p>
        </Reveal>
      </>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <AboutHero
        eyebrow="Tentang Halden Residences"
        lines={["Cara", "kami", "bekerja"]}
        aside="Seleksi, inspeksi, dan pendampingan sewa untuk rumah dan apartemen di Jakarta Selatan dan Jakarta Pusat."
      />

      <Container className="pb-24 md:pb-36">
        <DrawLine />
        <div className="grid gap-x-10 gap-y-8 pt-16 md:pt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <Label className="text-ink/60">Singkatnya</Label>
          </Reveal>
          <ScrollRevealText
            className="text-[clamp(1.5rem,2.7vw,2.5rem)] leading-[1.3] tracking-[-0.01em] text-pretty lg:col-span-9"
            text="Halden Residences menyewakan rumah dan apartemen atas nama pemiliknya. Kami memeriksa setiap hunian sebelum menawarkannya, menuliskan semua biaya apa adanya, dan tetap menjadi kontak Anda selama masa sewa."
          />
        </div>
      </Container>

      <ExpandingImage
        src="/images/stills/house-02-living.jpg"
        alt="Ruang keluarga berplafon ganda dengan sofa sudut krem, meja kopi kayu oak, dan jendela setinggi dinding yang menghadap tanaman."
        caption={`Ruang keluarga Rumah Taman Kemang, salah satu dari ${properties.length} hunian yang kami tawarkan saat ini.`}
      />

      <div className="pt-24 md:pt-36">
        <VelocityMarquee items={["Seleksi", "Inspeksi", "Pendampingan"]} />
      </div>

      <Container className="pt-20 pb-28 md:pt-28 md:pb-36">
        <StackedTopics topics={topics} />

        <DrawLine className="mt-16 md:mt-24" />
        <div className="grid gap-x-10 gap-y-8 pt-16 md:pt-24 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="max-w-[52ch] text-[0.8125rem] leading-relaxed text-ink/60">
              Halden Residences adalah nama fiktif untuk proyek contoh. Proses di atas menggambarkan layanan yang
              dirancang untuk situs ini, bukan perusahaan yang sedang beroperasi.
            </p>
          </Reveal>
          <Reveal className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end" delay={0.1}>
            <Button href="/properties" size="sm">
              Lihat properti
            </Button>
            <ViewingTrigger tone="moss" size="sm">
              Jadwalkan survei
            </ViewingTrigger>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
