// EXAMPLE — copy this pattern into the real src/app/(marketing)/pricing/page.tsx
import BubbleHero from "@/components/hero/BubbleHero";
import { heroCopy } from "@/lib/heroCopy";

export default function PricingPage() {
  return (
    <>
      <BubbleHero {...heroCopy.pricing} />
      {/* ...rest of pricing content... */}
    </>
  );
}
