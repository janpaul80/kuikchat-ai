import BubbleHero from "@/components/hero/BubbleHero";
import { heroCopy } from "@/lib/heroCopy";

export default function SecurityPage() {
  return (
    <>
      <BubbleHero {...heroCopy.security} />
      {/* ...rest of security content... */}
    </>
  );
}
