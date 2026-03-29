import { HeroSection, FeatureCards, VisualAnalyticsSection, ConnectSection } from "@/components/features/home";
import { Footer } from "@/components/layout";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
      <VisualAnalyticsSection />
      <ConnectSection />
      <Footer />
    </>
  );
}
