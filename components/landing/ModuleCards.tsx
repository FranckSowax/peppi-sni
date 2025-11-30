'use client';

import Link from 'next/link';
import { 
  Target, 
  ShoppingCart, 
  HardHat, 
  Wallet, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
}

const modules: Module[] = [
  {
    id: 'strategie',
    title: 'Stratégie',
    description: 'Pilotage des KPIs et suivi des plans d\'action stratégiques',
    icon: <Target className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: ['Tableaux de bord KPI', 'Plans d\'action', 'Objectifs stratégiques'],
  },
  {
    id: 'achats',
    title: 'Achats / Supply',
    description: 'Gestion des commandes, stocks et relations fournisseurs',
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    features: ['Commandes fournisseurs', 'Niveaux de stock', 'Suivi livraisons'],
  },
  {
    id: 'chantier',
    title: 'Chantier / WhatsApp',
    description: 'Suivi terrain en temps réel via intégration WhatsApp',
    icon: <HardHat className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    features: ['Feed WhatsApp live', 'Photos chantier', 'Alertes incidents'],
  },
  {
    id: 'finance',
    title: 'Finance',
    description: 'Suivi budgétaire, facturation et gestion des paiements',
    icon: <Wallet className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Budget vs Réalisé', 'Factures', 'Statuts paiements'],
  },
  {
    id: 'commercial',
    title: 'Commercial',
    description: 'Pipeline de ventes, réservations et suivi clients',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    features: ['Pipeline ventes', 'Réservations', 'Suivi paiements'],
  },
];

export function ModuleCards() {
  return (
    <section id="modules" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nos Modules Métier
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cinq micro-SaaS spécialisés pour couvrir l&apos;ensemble de vos besoins 
            en gestion de projets immobiliers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link href="/login" key={module.id}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 ${module.bgColor} ${module.color} rounded-lg flex items-center justify-center mb-4`}>
                    {module.icon}
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {module.title}
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
