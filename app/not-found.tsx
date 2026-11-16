import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";

export default function NotFound() {
  return (
    <Container className="min-h-[70svh] pt-[calc(var(--spacing-nav)+6rem)] pb-28">
      <Label className="text-ink/60">Tidak ditemukan</Label>
      <Heading level={1} size="xl" className="mt-6 max-w-[18ch]">
        Halaman atau listing ini tidak ada.
      </Heading>
      <p className="mt-6 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink/70">
        Alamatnya mungkin salah ketik, atau listingnya sudah tersewa dan diturunkan.
      </p>
      <Button href="/properties" size="sm" className="mt-10">
        Lihat listing yang tersedia
      </Button>
    </Container>
  );
}
