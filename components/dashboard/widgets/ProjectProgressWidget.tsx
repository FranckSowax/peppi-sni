'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  region: string | null;
  phase: string;
  progress: number;
  status: string;
  budget: number | null;
  end_date: string | null;
}

const phaseConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  planification: { label: 'Planification', color: 'bg-gray-100 text-gray-700', icon: Clock },
  conception: { label: 'Conception', color: 'bg-blue-100 text-blue-700', icon: Clock },
  construction: { label: 'Construction', color: 'bg-amber-100 text-amber-700', icon: TrendingUp },
  livraison: { label: 'Livraison', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  termine: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

export function ProjectProgressWidget() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'progress' | 'name' | 'phase'>('progress');
  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('progress', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    if (sortBy === 'progress') return b.progress - a.progress;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'phase') return (a.phase || '').localeCompare(b.phase || '');
    return 0;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 80) return { text: 'Avancé', color: 'bg-green-100 text-green-700' };
    if (progress >= 50) return { text: 'En cours', color: 'bg-amber-100 text-amber-700' };
    if (progress >= 25) return { text: 'Démarré', color: 'bg-blue-100 text-blue-700' };
    return { text: 'Initial', color: 'bg-gray-100 text-gray-600' };
  };

  // Stats globales
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;
  const completedCount = projects.filter(p => p.progress >= 100 || p.phase === 'termine').length;
  const inProgressCount = projects.filter(p => p.progress > 0 && p.progress < 100).length;
  const criticalCount = projects.filter(p => p.progress < 30 && p.phase === 'construction').length;

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Avancement des Projets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Avancement des Projets
          </CardTitle>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'progress' | 'name' | 'phase')}
            className="text-sm border rounded-md px-2 py-1 bg-background"
          >
            <option value="progress">Par avancement</option>
            <option value="name">Par nom</option>
            <option value="phase">Par phase</option>
          </select>
        </div>
        
        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center p-2 bg-primary/5 rounded-lg">
            <p className="text-2xl font-bold text-primary">{avgProgress}%</p>
            <p className="text-xs text-gray-500">Moyenne</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-gray-500">Terminés</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{inProgressCount}</p>
            <p className="text-xs text-gray-500">En cours</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500">Critiques</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {sortedProjects.map((project) => {
            const phase = phaseConfig[project.phase] || phaseConfig.planification;
            const PhaseIcon = phase.icon;
            const status = getStatusBadge(project.progress);
            const isExpanded = expandedProject === project.id;

            return (
              <div 
                key={project.id}
                className={cn(
                  "border rounded-lg overflow-hidden transition-all",
                  isExpanded ? "border-primary/30 shadow-sm" : "border-gray-200"
                )}
              >
                {/* Header - toujours visible */}
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{project.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{project.region || 'Non défini'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{project.progress}%</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all', getProgressColor(project.progress))}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Détails - visible si expanded */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 bg-gray-50 border-t">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs flex items-center gap-1', phase.color)}>
                        <PhaseIcon className="w-3 h-3" />
                        {phase.label}
                      </span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs', status.color)}>
                        {status.text}
                      </span>
                      {project.progress < 30 && project.phase === 'construction' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Retard
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Budget:</span>
                        <span className="ml-1 font-medium">
                          {project.budget 
                            ? `${(project.budget / 1000000000).toFixed(1)} Mds XAF`
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Échéance:</span>
                        <span className="ml-1 font-medium">
                          {project.end_date 
                            ? new Date(project.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/dashboard/projets/${project.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Voir les détails →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          {projects.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Aucun projet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
