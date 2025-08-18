import Link from "next/link"
import { Mail, Phone, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className=" text-gray-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 bg-gray-800 p-8 rounded-lg">
        {/* Sección de Información de la Empresa */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">GorraStyle</h3>
          <p className="text-sm leading-relaxed">
            Tu destino para las gorras más exclusivas y de moda. Calidad y estilo en cada detalle.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        {/* Enlaces Rápidos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Enlaces Rápidos</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="#productos" className="hover:text-white transition-colors">
                Productos
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                Sobre Nosotros
              </Link>
            </li>
            
          </ul>
        </div>

        {/* Soporte */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Soporte</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/faq" className="hover:text-white transition-colors">
                Preguntas Frecuentes
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-white transition-colors">
                Envíos y Devoluciones
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Política de Privacidad
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Contáctanos</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Mail size={16} />
              <a href="mailto:info@gorrastyle.com" className="hover:text-white transition-colors">
                info@gorrastyle.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} />
              <a href="tel:+573025636290" className="hover:text-white transition-colors">
                +57 302 563 6290
              </a>
            </li>
            <li className="text-sm">Dirección: Calle Ficticia 123, Ciudad, País</li>
          </ul>
        </div>
      </div>

      {/* Derechos de Autor */}
      <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-500 text-xs">
        © {year} GorraStyle. Todos los derechos reservados.
      </div>
    </footer>
  )
}
