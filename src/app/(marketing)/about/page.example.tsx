// Replaces the old GlowBackground hero. Keep AboutContent below. No <Footer/> here.
import BubbleHero from "@/components/hero/BubbleHero";
import { heroCopy } from "@/lib/heroCopy";
import AboutContent from "@/components/landing/AboutContent";

export default function AboutPage() {
  return (
    <>
      <BubbleHero {...heroCopy.about} />
      <AboutContent />
    </>
  );
}
