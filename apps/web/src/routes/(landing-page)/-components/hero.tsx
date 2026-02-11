import { Button } from "@repo/ui/components/ui/button";
import { Download, MapPin, Percent, Play, Star } from "lucide-react";
import { HeroSearchBar } from "./hero-search-bar";

const Hero = () => {
	return (
		<section className="pt-24 pb-16 min-h-screen flex items-center ">
			<div className="container mx-auto px-4">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Content */}
					<div className="space-y-8">
						<div className="space-y-4">
							<div className="flex items-center space-x-2 text-primary">
								<Star className="w-5 h-5 fill-current" />
								<span className="font-semibold">+1M usuarios en Argentina</span>
							</div>

							<h1 className="text-5xl lg:text-6xl font-fredoka font-bold leading-tight">
								Descubrí la mejor
								<span className="text-gradient block">gastronomía urbana</span>
								con descuentos únicos
							</h1>

							<p className="text-xl text-gray-600 leading-relaxed">
								Encontrá bares, restaurantes y cafeterías cerca tuyo, aprovechá
								promociones exclusivas y ganá puntos que podés canjear por
								beneficios. ¡La movida gastronómica está en tus manos!
							</p>
						</div>

						{/* Search Bar */}
						<HeroSearchBar />

						{/* Stats */}
						<div className="grid grid-cols-3 gap-6">
							<div className="text-center">
								<div className="text-3xl font-fredoka font-bold text-primary">
									1M+
								</div>
								<div className="text-sm text-gray-600">Usuarios activos</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-fredoka font-bold text-primary">
									5K+
								</div>
								<div className="text-sm text-gray-600">Restaurantes</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-fredoka font-bold text-primary">
									50%
								</div>
								<div className="text-sm text-gray-600">Descuento promedio</div>
							</div>
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col sm:flex-row gap-4">
							<Button
								size="lg"
								className="gradient-comidini hover:opacity-90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 text-lg"
							>
								<Download className="w-5 h-5 mr-2" />
								Descargar Gratis
							</Button>

							<Button
								size="lg"
								variant="outline"
								className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-full transition-all duration-300 text-lg"
							>
								<Play className="w-5 h-5 mr-2" />
								Ver Demo
							</Button>
						</div>

						{/* Available on */}
						<div className="text-sm text-gray-500">
							Disponible en Buenos Aires, Rosario, Santiago y pronto en toda
							Latinoamérica
						</div>
					</div>

					{/* Visual */}
					<div className="relative">
						<div className="relative z-10">
							{/* Phone Mockup */}
							<div className="w-80 h-[600px] mx-auto bg-gray-900 rounded-[3rem] p-4 shadow-2xl">
								<div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
									{/* Status Bar */}
									<div className="h-12 bg-gradient-to-r from-red to-orange flex items-center justify-between px-6 text-white text-sm font-medium">
										<span>9:41</span>
										<span>100%</span>
									</div>

									{/* App Content */}
									<div className="p-4 space-y-4">
										{/* Search Bar */}
										<div className="bg-gray-100 rounded-full px-4 py-3 flex items-center space-x-2">
											<MapPin className="w-5 h-5 text-primary" />
											<span className="text-gray-600">
												Buscar cerca de Palermo...
											</span>
										</div>

										{/* Quick Filters */}
										<div className="flex space-x-2">
											<div className="bg-primary text-white px-4 py-2 rounded-full text-sm">
												Todos
											</div>
											<div className="bg-gray-100 px-4 py-2 rounded-full text-sm">
												🍕 Pizza
											</div>
											<div className="bg-gray-100 px-4 py-2 rounded-full text-sm">
												☕ Café
											</div>
										</div>

										{/* Restaurant Cards */}
										<div className="space-y-3">
											<div className="bg-white border rounded-xl p-4 shadow-sm">
												<div className="flex justify-between items-start mb-2">
													<h3 className="font-semibold">La Birra Bar</h3>
													<div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
														-30%
													</div>
												</div>
												<p className="text-sm text-gray-600">
													Cerveza artesanal • Palermo
												</p>
												<div className="flex items-center justify-between mt-2">
													<div className="flex items-center space-x-1">
														<Star className="w-4 h-4 text-yellow-500 fill-current" />
														<span className="text-sm">4.8</span>
													</div>
													<div className="text-primary font-semibold text-sm">
														+120 puntos
													</div>
												</div>
											</div>

											<div className="bg-white border rounded-xl p-4 shadow-sm">
												<div className="flex justify-between items-start mb-2">
													<h3 className="font-semibold">Café Tortoni</h3>
													<div className="bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
														-25%
													</div>
												</div>
												<p className="text-sm text-gray-600">
													Café histórico • San Telmo
												</p>
												<div className="flex items-center justify-between mt-2">
													<div className="flex items-center space-x-1">
														<Star className="w-4 h-4 text-yellow-500 fill-current" />
														<span className="text-sm">4.9</span>
													</div>
													<div className="text-primary font-semibold text-sm">
														+95 puntos
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Floating Elements */}
						<div className="absolute top-20 -left-10 w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl animate-bounce-slow">
							🍕
						</div>
						<div
							className="absolute top-40 -right-10 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl animate-bounce-slow"
							style={{ animationDelay: "1s" }}
						>
							☕
						</div>
						<div
							className="absolute bottom-40 -left-5 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white animate-bounce-slow"
							style={{ animationDelay: "0.5s" }}
						>
							🍺
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
