import { auth } from "@/auth";
import { Navbar } from "@/components/homepage/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { AISection } from "@/components/homepage/AISection";
import { PricingSection } from "@/components/homepage/PricingSection";
import { CTASection } from "@/components/homepage/CTASection";
import { FooterSection } from "@/components/homepage/FooterSection";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Navbar session={session} />
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
