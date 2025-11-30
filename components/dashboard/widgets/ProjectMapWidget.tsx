'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Filter, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with Leaflet
const ProjectMap = dynamic(
  () => import('@/components/map/ProjectMap').then(mod => mod.ProjectMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-72 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Chargement de la carte...</div>
      </div>
    )
  }
);

// Mock projects data with coordinates
const mockProjects = [
  { id: 1, name: 'Résidence Okoumé', region: 'Libreville', phase: 'construction', progress: 75, latitude: 0.4162, longitude: 9.4673, alertsCount: 2 },
  { id: 2, name: 'Marina Bay Libreville', region: 'Libreville', phase: 'construction', progress: 45, latitude: 0.4262, longitude: 9.4473, alertsCount: 5 },
  { id: 3, name: 'Centre Commercial Akanda', region: 'Akanda', phase: 'livraison', progress: 92, latitude: 0.5062, longitude: 9.4873, alertsCount: 0 },
  { id: 4, name: 'Logements Sociaux Ntoum', region: 'Ntoum', phase: 'conception', progress: 25, latitude: 0.3862, longitude: 9.7673, alertsCount: 1 },
  { id: 5, name: 'Cité Administrative Owendo', region: 'Owendo', phase: 'planification', progress: 10, latitude: 0.2962, longitude: 9.5073, alertsCount: 0 },
  { id: 6, name: 'Résidence Les Palmiers', region: 'Port-Gentil', phase: 'termine', progress: 100, latitude: -0.7193, longitude: 8.7815, alertsCount: 0 },
];

export function ProjectMapWidget() {
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const activeProjects = mockProjects.filter(p => p.phase !== 'termine').length;

  return (
    <div className="bg-white rounded-xl border h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Carte des Projets</h3>
          <p className="text-sm text-gray-500">{activeProjects} projets actifs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Filtres
          </Button>
          <Link href="/dashboard/projets">
            <Button variant="ghost" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex-1 min-h-[288px]">
        <ProjectMap 
          projects={mockProjects}
          height="100%"
          showControls={true}
          selectedProjectId={selectedProject}
          onProjectSelect={setSelectedProject}
        />
      </div>
    </div>
  );
}
