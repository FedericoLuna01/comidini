import { Button } from "@repo/ui/components/ui/button";
import { Download, Smartphone, Apple, PlayCircle } from "lucide-react";

const DownloadCTA = () => {
  return (
    <section id="descargar" className="py-20 bg-gradient-to-r from-orange-400/10 to-rose-400/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-6">
              ¡Probá
              <span className="text-primary"> Comidini</span> gratis!
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Comenzá a ahorrar en tus lugares favoritos y descubrí nuevos sabores. Disponible para iOS y Android.
            </p>
          </div>

          {/* Social proof */}
          <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
            <div>
              <div className="text-3xl font-fredoka font-bold text-primary mb-2">4.8★</div>
              <div className="text-gray-600">Calificación promedio</div>
            </div>
            <div>
              <div className="text-3xl font-fredoka font-bold text-orange-400 mb-2">1M+</div>
              <div className="text-gray-600">Descargas</div>
            </div>
            <div>
              <div className="text-3xl font-fredoka font-bold text-primary mb-2">5K+</div>
              <div className="text-gray-600">Restaurantes aliados</div>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Fácil de usar</div>
                <div className="text-sm text-gray-600">Interfaz intuitiva y rápida</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl">
              <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Gratis siempre</div>
                <div className="text-sm text-gray-600">Sin costos ocultos</div>
              </div>
            </div>
          </div>

          {/* QR Code mockup */}
          <div className="mt-12 p-8 bg-white rounded-2xl inline-block shadow-lg">
            <div className="text-center mb-4">
              <h4 className="font-semibold">¡Escaneá y descargá!</h4>
              <p className="text-sm text-gray-600">Código QR para descarga directa</p>
            </div>
            <div className="w-32 h-32 bg-gray-900 rounded-xl mx-auto relative">
              <div className="absolute inset-2 bg-white rounded-lg">
                <div className="p-2 h-full">
                  <div className="grid grid-cols-8 gap-1 h-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`${Math.random() > 0.5 ? "bg-black" : "bg-white"} rounded-sm`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 gradient-comidini rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadCTA;
