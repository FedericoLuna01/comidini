import { Button } from "@repo/ui/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function RestaurantCTA() {
  return (
    <section id="restaurantes" className="py-24 bg-slate-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white to-transparent opacity-60" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="lg:w-1/2 space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
              Hacé crecer tu negocio con <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">Comidini</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Sumate a la plataforma que no solo te trae clientes, sino que te ayuda a fidelizarlos. Gestioná tus pedidos, menú y promociones desde un solo lugar.
            </p>
            
            <div className="space-y-4">
              {[
                "0% de comisión el primer mes",
                "Herramientas de marketing integradas",
                "Gestión de mesas y pedidos en tiempo real",
                "Pagos semanales asegurados"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <span className="text-lg font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
               <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8 h-14 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                 Registrar mi Restaurante
               </Button>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Abstract representation of dashboard */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Ventas de Hoy</div>
                        <div className="text-3xl font-bold text-slate-900">$ 124,500.00</div>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        +12.5%
                    </div>
                </div>
                <div className="space-y-4">
                    {[1,2,3].map((i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                <div>
                                    <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                                    <div className="h-3 w-20 bg-slate-200 rounded" />
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="h-4 w-16 bg-slate-200 rounded mb-2" />
                                <div className="h-3 w-10 bg-slate-200 rounded ml-auto" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Decorative elements */}
             <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary rounded-full blur-2xl opacity-20" />
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-2xl opacity-20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
