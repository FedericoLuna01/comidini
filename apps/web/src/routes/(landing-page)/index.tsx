import { createFileRoute } from "@tanstack/react-router";
import DownloadCTA from "./-components/download-cta";
import Features from "./-components/features";
import Footer from "./-components/footer";
import { Header } from "./-components/header";
import Hero from "./-components/hero";
import InteractiveMap from "./-components/interactive-map";
import PointsSystem from "./-components/point-system";

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
