import { Button } from "@repo/ui/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Utensils } from "lucide-react";
import { motion } from "motion/react";

export function SiteHeader() {
	return (
		<motion.header
			className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				        <div className="flex items-center gap-2">
				          <div className="bg-gradient-to-r from-orange-400 to-rose-400 text-white p-1.5 rounded-lg">
				            <Utensils className="w-5 h-5" />
				          </div>
				          <span className="font-bold text-xl tracking-tight text-gray-900">Comidini</span>
				        </div>
				
				        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
				          <a href="#features" className="hover:text-rose-500 transition-colors">Beneficios</a>
				          <a href="#puntos" className="hover:text-rose-500 transition-colors">Sistema de Puntos</a>
				          <a href="#mapa" className="hover:text-rose-500 transition-colors">Mapa</a>
				          <a href="#restaurantes" className="hover:text-rose-500 transition-colors">Restaurantes</a>
				        </nav>
				
				        <div className="flex items-center gap-4">
				          <Link to="/iniciar-sesion" className="text-sm font-medium text-gray-600 hover:text-rose-500 hidden sm:block">
				            Iniciar Sesión
				          </Link>
				          <Button className="rounded-full font-semibold px-6 shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all bg-gradient-to-r from-orange-400 to-rose-400 border-0 text-white">
				            Empezar ahora
				          </Button>
				        </div>
			</div>
		</motion.header>
	);
}
