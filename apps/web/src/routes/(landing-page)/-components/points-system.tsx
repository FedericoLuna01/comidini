import { Button } from "@repo/ui/components/ui/button";
import { ArrowRight, Gift, QrCode, Utensils } from "lucide-react";
import { motion } from "motion/react";

export function PointsSystem() {
	const steps = [
		{
			id: 1,
			title: "Descubrí & Comé",
			desc: "Elegí tu restaurante favorito y disfrutá de tu comida.",
			icon: Utensils,
		},
		{
			id: 2,
			title: "Cargá tu Ticket",
			desc: "Al pagar, cargá el código de tu ticket en tu cuenta para sumar puntos.",
			icon: QrCode,
		},
		{
			id: 3,
			title: "Canjeá Beneficios",
			desc: "Usá tus puntos para pagar tu próxima comida o tener descuentos.",
			icon: Gift,
		},
	];

	return (
		<section id="puntos" className="py-24 relative overflow-hidden">
			{/* Background Pattern */}
			<div
				className="absolute inset-0 opacity-10"
				style={{
					backgroundImage:
						"radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
					backgroundSize: "40px 40px",
				}}
			/>

			<div className="container mx-auto px-4 relative z-10">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<div className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/20 text-black font-medium text-sm mb-6 shadow-sm">
							✨ Programa de Recompensas
						</div>
						<h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
							Cada bocado <br />
							<span className="text-black drop-shadow-md">
								tiene su recompensa
							</span>
						</h2>
						<p className="text-gray-600 text-lg mb-8 leading-relaxed">
							No es solo comer, es invertir en tu próxima experiencia. Con
							nuestro sistema de puntos, tu fidelidad se convierte en platos
							gratis, descuentos exclusivos y acceso a eventos VIP.
						</p>
						<Button
							size="lg"
							className="bg-white text-rose-600 hover:bg-orange-50 font-bold rounded-full px-8 h-12 shadow-xl border-none"
						>
							Empezar a Sumar Puntos <ArrowRight className="ml-2 w-4 h-4" />
						</Button>
					</motion.div>

					<div className="space-y-8">
						{steps.map((step, index) => (
							<motion.div
								key={step.id}
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.2 }}
								className="flex items-start gap-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group shadow-lg"
							>
								<div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-rose-600 text-black transition-colors duration-300">
									<step.icon className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-xl font-bold mb-2 text-black">
										{step.title}
									</h3>
									<p className="text-gray-600">{step.desc}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
