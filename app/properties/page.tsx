import type { Metadata } from "next";
import { PropertyBrowser } from "@/components/property/PropertyBrowser";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { properties } from "@/src/data/properties";

export const metadata: Metadata = {
  title: "Properti",
  description: "Rumah dan apartemen untuk disewa di Kemang, Senopati, Menteng, BSD City, dan Pantai Indah Kapuk.",
};

export default function PropertiesPage() {
  return (
    <Container className="pt-[calc(var(--spacing-nav)+4rem)] pb-28 md:pb-36">
      <header className="pb-10">
        <Label className="text-ink/60">Properti</Label>
        <Heading level={1} size="lg" className="mt-5">
          Rumah dan apartemen untuk disewa
        </Heading>
      </header>
      <PropertyBrowser properties={properties} />
    </Container>
  );
}
