import { HeroSection, FeatureCards, VisualAnalyticsSection, RecordsSection, DisclaimerSection, ConnectSection } from "@/components/features/home";
import { Footer } from "@/components/layout";

export default function WelcomePage() {
  return (
    <>
      <HeroSection />
      <RecordsSection />
      <FeatureCards />
      <VisualAnalyticsSection />
      <DisclaimerSection />
      <ConnectSection />
      <Footer />
    </>
  );
}
