import { HeroSection, FeatureCards, VisualAnalyticsSection, ConnectSection, ParticleCanvas } from "@/components/features/home";
import { Footer } from "@/components/layout";

export default function Home() {
  return (
    <div className="relative">
      <ParticleCanvas />
      <HeroSection />
      <FeatureCards />
      <VisualAnalyticsSection />
      <ConnectSection />
      <Footer />
    </div>
  );
}
