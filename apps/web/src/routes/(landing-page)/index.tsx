import { createFileRoute } from "@tanstack/react-router";
import { Header } from "./-components/header";
import Hero from "./-components/hero";
import Features from "./-components/features";
import InteractiveMap from "./-components/interactive-map";
import PointsSystem from "./-components/point-system";
import DownloadCTA from "./-components/download-cta";
import Footer from "./-components/footer";

export const Route = createFileRoute("/(landing-page)/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <InteractiveMap />
      <PointsSystem />
      <DownloadCTA />
      <Footer />
    </>
  );
}
