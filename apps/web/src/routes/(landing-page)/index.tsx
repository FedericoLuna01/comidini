import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "./-components/site-header";
import { Hero } from "./-components/hero";
import { FeaturesGrid } from "./-components/features-grid";
import { PointsSystem } from "./-components/points-system";
import { RestaurantFinder } from "./-components/restaurant-finder";
import { RestaurantCTA } from "./-components/restaurant-cta";
import { FAQSection } from "./-components/faq-section";
import { SiteFooter } from "./-components/site-footer";

export const Route = createFileRoute("/(landing-page)/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <SiteHeader />
      <main>
        <Hero />
        <FeaturesGrid />
        <PointsSystem />
        <RestaurantFinder />
        <RestaurantCTA />
        <FAQSection />
      </main>
      <SiteFooter />
    </div>
  );
}