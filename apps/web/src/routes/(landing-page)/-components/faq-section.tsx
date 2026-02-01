import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@repo/ui/components/ui/accordion";

const faqs = [
	{
		question: "¿Cómo funciona el sistema de puntos?",
		answer:
			"Es simple: cada vez que realizás un pedido o pagás en un local adherido escaneando tu QR, acumulás puntos. Esos puntos se guardan en tu billetera virtual y podés canjearlos por descuentos directos o platos gratis en futuras compras.",
	},
	{
		question: "¿La app es gratuita?",
		answer:
			"¡Sí! Descargar Comidini y crear una cuenta es 100% gratuito para los usuarios. Solo pagás por lo que consumís en los restaurantes.",
	},
	{
		question: "¿Cómo registro mi restaurante?",
		answer:
			"Si tenés un local gastronómico, podés registrarte desde nuestra web en la sección 'Restaurantes'. Un asesor se pondrá en contacto con vos para configurar tu menú y activar tu cuenta en menos de 24 horas.",
	},
	{
		question: "¿En qué ciudades están disponibles?",
		answer:
			"Actualmente estamos operando en Buenos Aires, Córdoba y Rosario. Estamos expandiéndonos rápidamente a otras ciudades principales de Latinoamérica.",
	},
];

export function FAQSection() {
	return (
		<section className="py-24 bg-white">
			<div className="container mx-auto px-4 max-w-3xl">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						Preguntas Frecuentes
					</h2>
					<p className="text-gray-600">
						Todo lo que necesitás saber sobre Comidini
					</p>
				</div>

				<Accordion type="single" collapsible className="w-full space-y-4 py-2">
					{faqs.map((faq, index) => (
						<AccordionItem
							key={index}
							value={`item-${index}`}
							className="border rounded-xl px-6 bg-gray-50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all duration-200"
						>
							<AccordionTrigger className="text-left font-semibold text-lg py-4 hover:no-underline hover:text-primary">
								{faq.question}
							</AccordionTrigger>
							<AccordionContent className="text-gray-600 pb-6 leading-relaxed">
								{faq.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</section>
	);
}
