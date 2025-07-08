import { MapPin, Gift, Star, Zap, Users, Trophy } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: MapPin,
      title: "Mapa Interactivo",
      description: "Encontrá restaurantes, bares y cafeterías cerca tuyo con promociones en tiempo real",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Gift,
      title: "Descuentos Exclusivos",
      description: "Aprovechá promociones únicas de hasta 50% en tus lugares favoritos",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Star,
      title: "Sistema de Puntos",
      description: "Ganá puntos con cada consumo y canjealos por beneficios increíbles",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Zap,
      title: "Experiencia Rápida",
      description: "Reservá, pedí y pagá desde la app. Todo en segundos",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Conectate con otros foodies y descubrí lugares através de recomendaciones",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Trophy,
      title: "Recompensas VIP",
      description: "Accedé a eventos exclusivos, degustaciones y experiencias únicas",
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-fredoka font-bold mb-6">
            ¿Cómo funciona
            <span className="text-transparent bg-clip-text gradient-comidini font-bold"> Comidini</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubrí una nueva forma de vivir la gastronomía urbana. Simple, rápido y con beneficios únicos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-fredoka font-semibold mb-4 text-gray-900">{feature.title}</h3>

                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
