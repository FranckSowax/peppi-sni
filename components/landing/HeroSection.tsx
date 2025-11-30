import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Map, MessageSquare, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Plateforme sécurisée SNI
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Pilotez vos projets immobiliers avec{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              PEPPI-SNI
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Une plateforme centralisée pour la Direction Générale de la SNI. 
            Visualisez, analysez et décidez en temps réel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Accéder à la plateforme
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#modules">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white/30 hover:bg-white/10">
                Découvrir les modules
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Map className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Carte Interactive</h3>
              <p className="text-sm text-gray-400 text-center">
                Visualisez tous vos projets sur une carte avec filtres avancés
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Tableaux de Bord</h3>
              <p className="text-sm text-gray-400 text-center">
                KPIs en temps réel et rapports automatisés PDF/Excel
              </p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Assistant IA</h3>
              <p className="text-sm text-gray-400 text-center">
                Gemini intégré pour analyses et génération de rapports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
    </section>
  );
}
