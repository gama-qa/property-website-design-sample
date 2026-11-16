import { ClosingCta } from "@/components/home/ClosingCta";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Walkthrough } from "@/components/walkthrough/Walkthrough";

export default function HomePage() {
  return (
    <>
      <Walkthrough
        clipIds={["house-02"]}
        title="HALDEN"
        eyebrow="Rumah disewakan · Kemang, Jakarta Selatan"
        sentence="Rumah dan apartemen untuk disewa di Jakarta Selatan dan Jakarta Pusat. Gulir untuk menyusuri rumah empat kamar di Kemang."
      />

      {/* The walkthrough ends on warm white (paper); these sections stay on it, so there is no colour seam. No WebGL below this line. */}
      <HowItWorks />
      <FeaturedProperties />
      <ClosingCta />
    </>
  );
}
