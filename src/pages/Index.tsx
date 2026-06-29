import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Privacy } from "@/components/landing/Privacy";
import { Apps } from "@/components/landing/Apps";
import { About } from "@/components/landing/About";
import { Footer } from "@/components/landing/Footer";
import { LandingChatbot } from "@/components/landing/LandingChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white dark">
      <Header />
      <main>
        <Hero />
        <Features />
        <Privacy />
        <About />
        <Apps />
      </main>
      <Footer />
      <LandingChatbot />
    </div>
  );
};

export default Index;
