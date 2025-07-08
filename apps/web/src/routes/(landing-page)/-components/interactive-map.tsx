import { MapPin, Star, Clock, Navigation } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

const InteractiveMap = () => {
  const restaurants = [
    {
      id: 1,
      name: "La Parolaccia",
      type: "🍝 Italiana",
      discount: 30,
      points: 150,
      rating: 4.8,
      position: { top: "25%", left: "30%" },
    },
    {
      id: 2,
      name: "Don Julio",
      type: "🥩 Parrilla",
      discount: 25,
      points: 200,
      rating: 4.9,
      position: { top: "40%", left: "60%" },
    },
    {
      id: 3,
      name: "Café Tortoni",
      type: "☕ Café",
      discount: 20,
      points: 80,
      rating: 4.7,
      position: { top: "60%", left: "40%" },
    },
    {
      id: 4,
      name: "Mishiguene",
      type: "🥙 Medio Oriente",
      discount: 35,
      points: 180,
      rating: 4.6,
      position: { top: "30%", left: "75%" },
    },
    {
      id: 5,
      name: "Antares",
      type: "🍺 Cervecería",
      discount: 40,
      points: 120,
      rating: 4.5,
      position: { top: "70%", left: "25%" },
    },
  ];

  return (
    <section id="restaurantes" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-6">
            Explorá el
            <span className="text-transparent bg-clip-text gradient-comidini font-bold"> mapa gastronómico</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Más de 5,000 restaurantes, bares y cafeterías te esperan con descuentos exclusivos en Buenos Aires y más
            ciudades.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Map Header */}
            <div className="gradient-comidini p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Navigation className="w-6 h-6" />
                  <div className="bg-gradient-comidini">
                    <h3 className="font-semibold text-lg">Palermo, Buenos Aires</h3>
                    <p className="opacity-90">47 lugares con descuentos activos</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Filtrar
                </Button>
              </div>
            </div>

            {/* Interactive Map Area */}
            <div className="relative h-96 bg-gradient-comidini from-blue-50 to-green-50 overflow-hidden">
              {/* Map Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Street Lines */}
              <div className="absolute inset-0">
                <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-300 opacity-30"></div>
                <div className="absolute top-2/3 left-0 right-0 h-1 bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-3/4 w-1 bg-gray-300 opacity-30"></div>
              </div>

              {/* Restaurant Pins */}
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={restaurant.position}
                >
                  {/* Pin */}
                  <div className="relative">
                    <div className="w-8 h-8 bg-primary rounded-full border-4 border-primary shadow-lg flex items-center justify-center animate-bounce-slow">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>

                    {/* Discount Badge */}
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{restaurant.discount}%
                    </div>
                  </div>

                  {/* Hover Card */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl p-4 min-w-64 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                          <p className="text-sm text-gray-600">{restaurant.type}</p>
                        </div>
                        <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          -{restaurant.discount}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{restaurant.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-primary font-semibold">
                          <span>+{restaurant.points} puntos</span>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Abierto hasta 23:00</span>
                      </div>

                      <Button size="sm" className="w-full gradient-comidini text-white hover:opacity-90">
                        Ver Menú
                      </Button>
                    </div>

                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Footer */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Mostrando 47 de 1,247 lugares disponibles</div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span>Con descuentos</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Disponibles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveMap;
