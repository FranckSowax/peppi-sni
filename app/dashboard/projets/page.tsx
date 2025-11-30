'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Search, 
  Grid3X3, 
  List, 
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjects } from '@/lib/hooks/useProjects';

// Configuration des phases
const phaseConfig = {
  planification: { label: 'Planification', color: 'bg-gray-100 text-gray-700', icon: Clock },
  conception: { label: 'Conception', color: 'bg-blue-100 text-blue-700', icon: Clock },
  construction: { label: 'Construction', color: 'bg-amber-100 text-amber-700', icon: TrendingUp },
  livraison: { label: 'Livraison', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  termine: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

function formatCurrency(amount: number | null) {
  if (!amount) return '0 XAF';
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + ' Mds XAF';
  }
  return (amount / 1000000).toFixed(0) + ' M XAF';
}

export default function ProjetsPage() {
  const { projects, loading } = useProjects();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.region || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = filterPhase === 'all' || project.phase === filterPhase;
    return matchesSearch && matchesPhase;
  });

  const stats = {
    total: projects.length,
    actifs: projects.filter(p => p.status === 'actif').length,
    enConstruction: projects.filter(p => p.phase === 'construction').length,
    termines: projects.filter(p => p.status === 'termine').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Nos Projets" subtitle="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Nos Projets" 
        subtitle="Vue d'ensemble de tous les projets immobiliers SNI" 
      />
      
      <main className="p-6">
        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total Projets</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-green-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Projets Actifs</p>
              <p className="text-3xl font-bold text-green-600">{stats.actifs}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-100 to-amber-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">En Construction</p>
              <p className="text-3xl font-bold text-amber-600">{stats.enConstruction}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-100 to-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Terminés</p>
              <p className="text-3xl font-bold text-blue-600">{stats.termines}</p>
            </CardContent>
          </Card>
        </div>

        {/* Barre d'outils */}
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
          
          <div className="flex items-center gap-2">
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">Toutes les phases</option>
              <option value="planification">Planification</option>
              <option value="conception">Conception</option>
              <option value="construction">Construction</option>
              <option value="livraison">Livraison</option>
              <option value="termine">Terminé</option>
            </select>

            <div className="flex border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-gray-100'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Projet
            </Button>
          </div>
        </div>

        {/* Liste des projets */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const phaseKey = project.phase as keyof typeof phaseConfig;
              const phase = phaseConfig[phaseKey] || phaseConfig.planification;
              const PhaseIcon = phase.icon;
              return (
                <Link href={`/dashboard/projets/${project.id}`} key={project.id}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                    {/* Image placeholder */}
                    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-400" />
                      </div>
                      {(project.alertsCount || 0) > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {project.alertsCount}
                        </div>
                      )}
                      <div className={cn('absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs flex items-center gap-1', phase.color)}>
                        <PhaseIcon className="w-3 h-3" />
                        {phase.label}
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description || 'Aucune description'}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        {project.region || 'Non défini'}
                        <span className="mx-1">•</span>
                        <Calendar className="w-4 h-4" />
                        {project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Progression</span>
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

                      {/* Budget */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Budget</span>
                        <span className="font-medium">{formatCurrency(project.budget)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600">Projet</th>
                    <th className="text-left p-4 font-medium text-gray-600">Région</th>
                    <th className="text-left p-4 font-medium text-gray-600">Phase</th>
                    <th className="text-left p-4 font-medium text-gray-600">Progression</th>
                    <th className="text-left p-4 font-medium text-gray-600">Budget</th>
                    <th className="text-left p-4 font-medium text-gray-600">Échéance</th>
                    <th className="text-left p-4 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => {
                    const phaseKey = project.phase as keyof typeof phaseConfig;
                    const phase = phaseConfig[phaseKey] || phaseConfig.planification;
                    return (
                      <tr key={project.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="text-xs text-gray-500">ID: {project.id}</p>
                            </div>
                            {(project.alertsCount || 0) > 0 && (
                              <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                {project.alertsCount}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{project.region || 'N/A'}</td>
                        <td className="p-4">
                          <span className={cn('px-2 py-1 rounded-full text-xs', phase.color)}>
                            {phase.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{formatCurrency(project.budget)}</td>
                        <td className="p-4 text-gray-600">
                          {project.end_date ? new Date(project.end_date).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="p-4">
                          <Link href={`/dashboard/projets/${project.id}`}>
                            <Button variant="ghost" size="sm">
                              Voir <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Message si aucun projet */}
        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Aucun projet trouvé</h3>
            <p className="text-gray-500">Modifiez vos filtres ou créez un nouveau projet</p>
          </div>
        )}
      </main>
    </div>
  );
}
