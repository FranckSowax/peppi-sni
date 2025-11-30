import Link from 'next/link';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white leading-tight">PEPPI-SNI</span>
                <span className="text-xs text-gray-400 leading-tight">
                  Société Nationale Immobilière du Gabon
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Plateforme centralisée de pilotage et de visualisation des projets immobiliers. 
              Un outil moderne pour une gestion efficace.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="#modules" className="hover:text-primary transition-colors">
                  Nos modules
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Libreville, Gabon</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+241 XX XX XX XX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>contact@sni.ga</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SNI Gabon. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/legal/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/legal/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
