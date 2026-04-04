import { Navbar } from "@/components/homepage/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { AISection } from "@/components/homepage/AISection";
import { PricingSection } from "@/components/homepage/PricingSection";
import { CTASection } from "@/components/homepage/CTASection";
import { FooterSection } from "@/components/homepage/FooterSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISection />
        <PricingSection />
        <CTASection />
      </main>
      <FooterSection />
    </>
  );
}
