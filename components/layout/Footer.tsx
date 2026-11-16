import Link from "next/link";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { NAV_ITEMS } from "./nav-items";

export function Footer() {
  return (
    <footer className="border-t border-stone">
      <Container className="grid gap-10 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-6">
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-[1.375rem] leading-none">Halden</span>
            <Label className="text-ink/60">Residences</Label>
          </Link>
          <p className="mt-5 max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink/60">
            Proyek contoh. Listing, harga, dan alamat bersifat fiktif.
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <ul className="flex flex-col gap-2 text-[0.8125rem]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <AnimatedLink href={item.href}>{item.label}</AnimatedLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-[0.8125rem] text-ink/60 md:col-span-3">
          <Label as="p" className="text-ink">
            Area layanan
          </Label>
          <p className="mt-3">Jakarta Selatan dan Jakarta Pusat</p>
        </div>
      </Container>
    </footer>
  );
}
