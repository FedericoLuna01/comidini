import { Button } from "@repo/ui/components/ui/button";
import { Coffee, Gift, Pizza, Star, Trophy } from "lucide-react";

const PointsSystem = () => {
	const rewards = [
		{ points: 100, reward: "Café gratis", icon: Coffee, color: "bg-amber-500" },
		{ points: 250, reward: "Descuento 15%", icon: Star, color: "bg-blue-500" },
		{ points: 500, reward: "Pizza familiar", icon: Pizza, color: "bg-red-500" },
		{ points: 1000, reward: "Cena para 2", icon: Gift, color: "bg-purple-500" },
		{
			points: 2000,
			reward: "Experiencia VIP",
			icon: Trophy,
			color: "bg-yellow-500",
		},
	];

	return (
		<section id="puntos" className="py-20 bg-white">
			<div className="container mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-6">
						Sistema de
						<span className="text-transparent bg-clip-text gradient-comidini font-bold">
							{" "}
							Puntos Comidini
						</span>
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Cada peso que gastes se convierte en puntos. Cuanto más usés
						Comidini, más beneficios ganás.
					</p>
				</div>

				<div className="max-w-6xl mx-auto">
					{/* How it works */}
					<div className="bg-gradient-to-r from-orange-400/10 to-rose-400/10 rounded-3xl p-8 mb-16">
						<div className="grid md:grid-cols-3 gap-8 text-center">
							<div className="space-y-4">
								<div className="w-16 h-16 gradient-comidini rounded-2xl flex items-center justify-center mx-auto">
									<span className="text-white font-fredoka font-bold text-2xl">
										1
									</span>
								</div>
								<h3 className="text-xl font-fredoka font-semibold">Consumís</h3>
								<p className="text-gray-600">
									Por cada $100 que gastes, ganás 10 puntos automáticamente
								</p>
							</div>

							<div className="space-y-4">
								<div className="w-16 h-16 gradient-comidini rounded-2xl flex items-center justify-center mx-auto">
									<span className="text-white font-fredoka font-bold text-2xl">
										2
									</span>
								</div>
								<h3 className="text-xl font-fredoka font-semibold">Acumulás</h3>
								<p className="text-gray-600">
									Tus puntos se suman y podés ver tu progreso en tiempo real
								</p>
							</div>

							<div className="space-y-4">
								<div className="w-16 h-16 gradient-comidini rounded-2xl flex items-center justify-center mx-auto">
									<span className="text-white font-fredoka font-bold text-2xl">
										3
									</span>
								</div>
								<h3 className="text-xl font-fredoka font-semibold">Canjeás</h3>
								<p className="text-gray-600">
									Usá tus puntos para obtener descuentos y experiencias únicas
								</p>
							</div>
						</div>
					</div>

					{/* User Progress Mockup */}
					<div className="bg-white rounded-3xl shadow-xl p-8 mb-16 border border-gray-100">
						<div className="text-center mb-8">
							<h3 className="text-2xl font-fredoka font-bold mb-2">
								Tu Progreso
							</h3>
							<p className="text-gray-600">Así se ve tu perfil en la app</p>
						</div>

						<div className="max-w-md mx-auto">
							{/* User Header */}
							<div className="text-center mb-8">
								<div className="w-20 h-20 gradient-comidini rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-white font-fredoka font-bold text-2xl">
										MF
									</span>
								</div>
								<h4 className="text-xl font-semibold">Comidini Fan</h4>
								<p className="text-gray-600">Miembro desde marzo 2024</p>
							</div>

							{/* Points Balance */}
							<div className="gradient-comidini rounded-2xl p-6 text-white text-center mb-6">
								<div className="text-4xl font-fredoka font-bold mb-2">
									1,247
								</div>
								<div className="opacity-90">Puntos disponibles</div>
							</div>

							{/* Progress to next reward */}
							<div className="bg-gray-50 rounded-2xl p-6 mb-6">
								<div className="flex items-center justify-between mb-4">
									<span className="font-semibold">Próxima recompensa</span>
									<span className="text-primary font-bold">253 puntos</span>
								</div>
								<div className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-ring rounded-full flex items-center justify-center">
										<Gift className="w-4 h-4 text-white" />
									</div>
									<div className="flex-1">
										<div className="text-sm font-medium">
											Cena para 2 personas
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mt-1">
											<div
												className="gradient-comidini h-2 rounded-full"
												style={{ width: "83%" }}
											></div>
										</div>
									</div>
								</div>
							</div>

							{/* Recent activity */}
							<div className="space-y-3">
								<h5 className="font-semibold text-gray-900">
									Actividad reciente
								</h5>
								<div className="space-y-2">
									<div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
												<span className="text-white text-xs">+</span>
											</div>
											<div>
												<div className="text-sm font-medium">La Birra Bar</div>
												<div className="text-xs text-gray-500">
													Hace 2 horas
												</div>
											</div>
										</div>
										<div className="text-emerald-500 font-bold">+120</div>
									</div>

									<div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
										<div className="flex items-center space-x-3">
											<div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
												<span className="text-white text-xs">-</span>
											</div>
											<div>
												<div className="text-sm font-medium">
													Café gratis canjeado
												</div>
												<div className="text-xs text-gray-500">Ayer</div>
											</div>
										</div>
										<div className="text-primary font-bold">-100</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Rewards Grid */}
					<div className="text-center mb-12">
						<h3 className="text-3xl font-fredoka font-bold mb-4">
							Canjeá tus puntos
						</h3>
						<p className="text-gray-600">
							Elegí entre cientos de recompensas disponibles
						</p>
					</div>

					<div className="grid md:grid-cols-5 gap-6">
						{rewards.map((reward, index) => {
							const Icon = reward.icon;
							return (
								<div
									key={index}
									className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
								>
									<div
										className={`w-16 h-16 ${reward.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
									>
										<Icon className="w-8 h-8 text-white" />
									</div>

									<div className="space-y-2">
										<div className="text-2xl font-fredoka font-bold text-ring">
											{reward.points}
										</div>
										<div className="text-sm font-medium text-gray-900">
											{reward.reward}
										</div>
									</div>

									<Button
										size="sm"
										variant="outline"
										className="mt-4 w-full border-primary text-primary hover:bg-primary hover:text-white"
									>
										Canjear
									</Button>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
};

export default PointsSystem;
