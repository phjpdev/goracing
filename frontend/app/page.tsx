import { HeroSection, FeatureCards, VisualAnalyticsSection, RecordsSection, ConnectSection } from "@/components/features/home";
import { Footer } from "@/components/layout";

export default function Home() {
  return (
    <>
      <HeroSection />
      <RecordsSection />
      <FeatureCards />
      <VisualAnalyticsSection />
      <ConnectSection />
      <Footer />
    </>
  );
}
