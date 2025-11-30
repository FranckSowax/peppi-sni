'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Package, 
  Search, 
  TrendingUp,
  ChevronRight,
  ShoppingCart,
  Truck,
  DollarSign,
  Loader2,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects } from '@/lib/hooks/useProjects';

// Configuration des phases
const phaseConfig = {
  planification: { label: 'Planification', color: 'bg-gray-100 text-gray-700' },
  conception: { label: 'Conception', color: 'bg-blue-100 text-blue-700' },
  construction: { label: 'Construction', color: 'bg-amber-100 text-amber-700' },
  livraison: { label: 'Livraison', color: 'bg-green-100 text-green-700' },
  termine: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700' },
};

function formatCurrency(amount: number | null) {
  if (!amount) return '0 XAF';
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + ' Mds';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(0) + ' M';
  }
  return amount.toLocaleString();
}

export default function AchatsPage() {
  const { projects, loading } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.region || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats globales
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'actif').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    inConstruction: projects.filter(p => p.phase === 'construction').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Achats / Supply" subtitle="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Achats / Supply" 
        subtitle="Gestion des matériaux et comparaison des prix par projet" 
      />
      
      <main className="p-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Projets</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-100 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">En construction</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.inConstruction}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-100 to-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Budget Total</p>
                  <p className="text-2xl font-bold text-blue-700">{formatCurrency(stats.totalBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un projet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des projets */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Sélectionnez un projet pour gérer ses matériaux
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              const phaseKey = project.phase as keyof typeof phaseConfig;
              const phase = phaseConfig[phaseKey] || phaseConfig.planification;
              
              return (
                <Link href={`/dashboard/achats/${project.id}`} key={project.id}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden border-2 hover:border-primary/30">
                    <CardContent className="p-0">
                      {/* Header avec image placeholder */}
                      <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className={cn('absolute top-3 left-3 px-2 py-1 rounded-full text-xs', phase.color)}>
                          {phase.label}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium">
                          {project.region || 'Non défini'}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                            {project.name}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {project.description || 'Cliquez pour gérer les matériaux de ce projet'}
                        </p>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Avancement</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                project.progress >= 80 ? 'bg-green-500' :
                                project.progress >= 50 ? 'bg-amber-500' : 'bg-primary'
                              )}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="flex items-center gap-2 pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package className="w-3 h-3" />
                            <span>Matériaux</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <BarChart3 className="w-3 h-3" />
                            <span>Comparaison</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3" />
                            <span>Prix</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Message si aucun projet */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Aucun projet trouvé</h3>
              <p className="text-gray-500">Modifiez votre recherche</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
