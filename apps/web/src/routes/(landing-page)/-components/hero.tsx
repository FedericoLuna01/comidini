import { Button } from "@repo/ui/components/ui/button";
import { Search, Star } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
	return (
		<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
			{/* Abstract Background Elements */}
			<div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-orange-100 rounded-full blur-3xl opacity-50 translate-x-1/3 -translate-y-1/4" />
			<div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl opacity-50 -translate-x-1/3 translate-y-1/4" />

			<div className="container mx-auto px-4">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					<motion.div
						className="space-y-8"
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
					>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-sm font-medium border border-orange-100">
							<Star className="w-4 h-4 fill-orange-400 text-orange-400" />
							<span>La plataforma #1 de gastronomía con recompensas</span>
						</div>

						<h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
							Comé rico, <br />
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
								ganá puntos,
							</span>{" "}
							<br />
							repetí.
						</h1>

						<p className="text-xl text-gray-600 max-w-lg leading-relaxed">
							Descubrí los mejores restaurantes de tu zona, accedé a descuentos
							exclusivos y convertí cada comida en saldo para la próxima. Todo
							desde tu navegador.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 pt-4">
							<Button
								size="lg"
								className="h-14 px-8 text-lg rounded-full shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-orange-400 to-rose-400 border-0 text-white"
							>
								Explorar Restaurantes
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-14 px-8 text-lg rounded-full border-2 hover:bg-gray-50 text-gray-700"
							>
								Soy un Restaurante
							</Button>
						</div>

						<div className="flex items-center gap-4 pt-8 text-sm text-gray-500">
							<div className="flex -space-x-3">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden"
									>
										<img
											src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i * 123}`}
											alt="User"
										/>
									</div>
								))}
							</div>
							<p>
								Únete a más de{" "}
								<span className="font-bold text-gray-900">10,000+</span>{" "}
								comensales
							</p>
						</div>
					</motion.div>

					{/* Hero Visual - Browser Mockup */}
					<motion.div
						className="relative lg:h-[600px] flex items-center justify-center"
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 z-20 transform lg:rotate-[-2deg] hover:rotate-0 transition-all duration-500">
							{/* Browser Toolbar */}
							<div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
								<div className="flex gap-1.5">
									<div className="w-3 h-3 rounded-full bg-red-400" />
									<div className="w-3 h-3 rounded-full bg-yellow-400" />
									<div className="w-3 h-3 rounded-full bg-green-400" />
								</div>
								<div className="flex-1 max-w-md mx-auto bg-white h-6 rounded-md border border-gray-200 flex items-center px-3 gap-2">
									<Search className="w-3 h-3 text-gray-400" />
									<div className="text-[10px] text-gray-400">
										comidini.com/explorar
									</div>
								</div>
							</div>

							{/* Web Content Mockup */}
							<div className="bg-white flex flex-col h-[400px]">
								<header className="h-12 border-b border-gray-100 flex items-center justify-between px-6">
									<div className="font-bold text-primary text-sm">Comidini</div>
									<div className="flex gap-4 items-center">
										<div className="w-20 h-2 bg-gray-100 rounded" />
										<div className="w-8 h-8 rounded-full bg-gray-200" />
									</div>
								</header>
								<div className="flex flex-1 overflow-hidden">
									<aside className="w-48 border-r border-gray-50 p-4 space-y-3 hidden md:block">
										{[1, 2, 3, 4].map((i) => (
											<div key={i} className="h-3 bg-gray-100 rounded w-full" />
										))}
									</aside>
									<main className="flex-1 p-6 space-y-6 overflow-y-auto">
										<div className="flex justify-between items-end">
											<div className="space-y-2">
												<div className="h-6 w-48 bg-gray-200 rounded" />
												<div className="h-3 w-32 bg-gray-100 rounded" />
											</div>
											<div className="h-8 w-24 bg-primary/20 rounded-full" />
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="h-32 bg-gray-100 rounded-xl" />
											<div className="h-32 bg-gray-100 rounded-xl" />
										</div>
									</main>
								</div>
							</div>

							{/* Floating Recompense Card */}
							<motion.div
								className="absolute top-1/2 -right-12 bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 hidden lg:block"
								initial={{ x: 20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 1, duration: 0.5 }}
							>
								<div className="flex items-center gap-4">
									<div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-primary">
										<Star className="w-6 h-6 fill-current" />
									</div>
									<div>
										<p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
											Saldo Acumulado
										</p>
										<p className="text-2xl font-bold text-gray-900">$2.450</p>
									</div>
								</div>
							</motion.div>
						</div>

						{/* Decorative Blobs */}
						<motion.div
							className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-orange-300/20 rounded-full blur-3xl -z-10"
							animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
						/>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
