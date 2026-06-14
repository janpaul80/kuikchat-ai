import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import CtaBand from "@/components/landing/CtaBand";

/**
 * KuikChat — Home route (Next.js App Router)
 * Path: src/app/page.tsx   (this route did NOT exist before — it is created here)
 *
 * NOTE: If you already have a Header/Nav component, import and place it above <Hero/>.
 * NOTE: If you have an existing Apps/Download section component, add it between Features and CtaBand.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Hero />
      <Features />
      <CtaBand />
      <Footer />
    </main>
  );
}
