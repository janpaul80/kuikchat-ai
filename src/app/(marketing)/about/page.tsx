import AboutContent from "@/components/landing/AboutContent";
import BubbleHero from "@/components/hero/BubbleHero";
import { heroCopy } from "@/lib/heroCopy";

export const metadata = {
  title: "About KuikChat - Where human connection meets AI power",
  description: "KuikChat is a privacy-first, AI-native messaging platform. Built by Paul Hartmann.",
};

export default function AboutPage() {
  return (
    <>
      <BubbleHero {...heroCopy.about} />
      <AboutContent />
    </>
  );
}
