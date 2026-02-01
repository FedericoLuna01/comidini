import { Utensils, Instagram, Twitter, Facebook } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className="bg-primary text-white p-1.5 rounded-lg">
                  <Utensils className="w-5 h-5" />
               </div>
               <span className="font-bold text-xl tracking-tight text-gray-900">Comidini</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              La plataforma que revoluciona la forma en que disfrutás la gastronomía. Comé, ganá y repetí.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors">Explorar</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Para Restaurantes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sistema de Puntos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mapa</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Carreras</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legales</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Comidini Inc. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
             <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
             <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
             <a href="#" className="text-gray-400 hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
