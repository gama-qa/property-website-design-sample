import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";

/** Top of a page without a hero: clears the fixed navbar. */
export function PageIntro({ label, title, children }: { label: string; title: string; children?: ReactNode }) {
  return (
    <Container className="pt-[calc(var(--spacing-nav)+6rem)] pb-16 md:pb-24">
      <Label className="text-ink/60">{label}</Label>
      <Heading level={1} size="xl" className="mt-6 max-w-[16ch]">
        {title}
      </Heading>
      {children}
    </Container>
  );
}
