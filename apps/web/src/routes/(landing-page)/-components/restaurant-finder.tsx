import { motion } from "motion/react";
import { MapPin, Navigation, Search } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export function RestaurantFinder() {
  return (
    <section id="mapa" className="py-24 bg-orange-50 relative overflow-hidden">
       {/* Background decorative circle */}
       <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-50" />
       
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Tu próximo plato favorito está a la vuelta de la esquina
          </h2>
          <p className="text-lg text-gray-600">
            Explorá el mapa interactivo para encontrar joyas ocultas, restaurantes con promociones activas y los lugares mejor calificados cerca de vos.
          </p>
        </div>

        <div className="relative w-full max-w-5xl mx-auto aspect-video bg-gray-200 rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
            {/* Mock Map UI */}
            <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-58.3816, -34.6037,13,0/800x600?access_token=pk.eyJ1IjoidXNlciIsImEiOiJjbHJsIn0.dummy')] bg-cover opacity-30 grayscale-[20%]">
                 <span className="text-gray-400 font-medium">Mapa Interactivo</span>
            </div>
            
            {/* Simulated Pins */}
            <motion.div 
                className="absolute top-1/3 left-1/4"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring" }}
            >
                <div className="relative group cursor-pointer">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg text-white border-4 border-white transform transition-transform group-hover:scale-110">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-gray-800">
                        Pizzeria Guerrin
                    </div>
                </div>
            </motion.div>

            <motion.div 
                className="absolute bottom-1/3 right-1/3"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
            >
                <div className="relative group cursor-pointer">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg text-white border-4 border-white transform transition-transform group-hover:scale-110">
                        <MapPin className="w-5 h-5" />
                    </div>
                     <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold text-gray-800">
                        Café Tortoni
                    </div>
                </div>
            </motion.div>
             
             {/* Search Bar Overlay */}
             <div className="absolute top-6 left-6 right-6 md:left-12 md:w-80 bg-white rounded-xl shadow-lg p-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400 ml-2" />
                <div className="text-gray-400 text-sm">Buscar en Palermo...</div>
             </div>

             {/* Floating FAB */}
             <div className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-700 transition-colors cursor-pointer">
                <Navigation className="w-6 h-6" />
             </div>
        </div>

        <div className="flex justify-center mt-12">
            <Button size="lg" className="rounded-full px-8 text-lg h-14 bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white transition-all">
                Abrir Mapa Completo
            </Button>
        </div>
      </div>
    </section>
  );
}
