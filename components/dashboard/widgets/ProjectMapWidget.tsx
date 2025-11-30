'use client';

import { MapPin, Filter, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Placeholder for map - will be replaced with actual Mapbox/Leaflet integration
export function ProjectMapWidget() {
  return (
    <div className="bg-white rounded-xl border h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Carte des Projets</h3>
          <p className="text-sm text-gray-500">24 projets actifs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Filtres
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="relative h-72 bg-gray-100">
        {/* Placeholder map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-sm">Carte interactive</p>
            <p className="text-gray-400 text-xs">Intégration Mapbox à venir</p>
          </div>
        </div>

        {/* Mock project markers */}
        <div className="absolute top-1/4 left-1/3">
          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
        </div>
        <div className="absolute top-1/2 left-1/2">
          <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
        </div>
        <div className="absolute top-2/3 left-1/4">
          <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-lg" />
        </div>
        <div className="absolute top-1/3 right-1/4">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 border-t flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600">En cours</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-gray-600">En retard</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-gray-600">Terminé</span>
        </div>
      </div>
    </div>
  );
}
