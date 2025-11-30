'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Fix for default marker icons in Next.js
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">🏗️</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface Project {
  id: number;
  name: string;
  region: string;
  phase: string;
  progress: number;
  latitude: number;
  longitude: number;
  alertsCount: number;
}

interface ProjectMapProps {
  projects: Project[];
  height?: string;
  showControls?: boolean;
  selectedProjectId?: number;
  onProjectSelect?: (projectId: number) => void;
}

// Component to handle map center changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function ProjectMap({ 
  projects, 
  height = '400px', 
  showControls = true,
  selectedProjectId,
  onProjectSelect 
}: ProjectMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0.4162, 9.4673]); // Libreville
  const [mapZoom, setMapZoom] = useState(11);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        setMapCenter([project.latitude, project.longitude]);
        setMapZoom(14);
      }
    }
  }, [selectedProjectId, projects]);

  const getMarkerColor = (phase: string, alertsCount: number) => {
    if (alertsCount > 0) return '#ef4444'; // red
    switch (phase) {
      case 'planification': return '#6b7280'; // gray
      case 'conception': return '#3b82f6'; // blue
      case 'construction': return '#f59e0b'; // amber
      case 'livraison': return '#22c55e'; // green
      case 'termine': return '#10b981'; // emerald
      default: return '#f5821f'; // primary
    }
  };

  const phaseLabels: Record<string, string> = {
    planification: 'Planification',
    conception: 'Conception',
    construction: 'Construction',
    livraison: 'Livraison',
    termine: 'Terminé',
  };

  if (!mounted) {
    return (
      <div 
        style={{ height }} 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <div className="text-gray-500 flex items-center gap-2">
          <MapPin className="w-5 h-5 animate-pulse" />
          Chargement de la carte...
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {projects.map((project) => (
          <Marker
            key={project.id}
            position={[project.latitude, project.longitude]}
            icon={createCustomIcon(getMarkerColor(project.phase, project.alertsCount))}
            eventHandlers={{
              click: () => onProjectSelect?.(project.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.region}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Phase:</span>
                    <span className="font-medium">{phaseLabels[project.phase] || project.phase}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progression:</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  {project.alertsCount > 0 && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {project.alertsCount} alerte(s)
                    </div>
                  )}
                </div>

                <Link href={`/dashboard/projets/${project.id}`}>
                  <Button size="sm" className="w-full">
                    Voir le projet
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Légende */}
      {showControls && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <p className="text-xs font-medium text-gray-700 mb-2">Légende</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Planification</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Conception</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Construction</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Livraison/Terminé</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Alertes</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
