import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import CtaBand from "@/components/landing/CtaBand";
import { SiteHeader } from "@/components/landing/SiteHeader";

/**
 * KuikChat — Home route (Next.js App Router)
 * Path: src/app/page.tsx
 */
export default function HomePage() {
  return (
    <main className="dark min-h-screen bg-black text-white">
      <SiteHeader />
      <Hero />
      <Features />
      <CtaBand />
      <Footer />
    </main>
  );
}
