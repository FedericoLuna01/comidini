import { Card } from "@repo/ui/components/ui/card";
import { motion } from "motion/react";
import { Clock, ShieldCheck, Smartphone, UtensilsCrossed } from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Variedad Gastronómica",
    description: "Desde bodegones clásicos hasta sushi de autor. Todo lo que te gusta en un solo lugar.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Clock,
    title: "Sin Esperas",
    description: "Reservá tu mesa o pedí para llevar y evitá las filas. Tu tiempo vale oro.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Smartphone,
    title: "Menú Digital",
    description: "Explorá los platos con fotos reales, precios actualizados y reseñas de otros usuarios.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: ShieldCheck,
    title: "Pagos Seguros",
    description: "Pagá desde la app con tu método preferido de forma rápida y 100% segura.",
    color: "bg-purple-100 text-purple-600",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mucho más que una app de comida</h2>
          <p className="text-gray-600 text-lg">
            Diseñamos Comidini para mejorar cada aspecto de tu experiencia gastronómica.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full border-none shadow-lg shadow-gray-100 hover:shadow-xl transition-shadow bg-gray-50/50 hover:bg-white">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
