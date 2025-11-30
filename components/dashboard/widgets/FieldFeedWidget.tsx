'use client';

import { MessageSquare, Image, AlertTriangle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedItem {
  id: number;
  sender: string;
  project: string;
  message: string;
  type: 'text' | 'image' | 'alert';
  time: string;
}

const mockFeed: FeedItem[] = [
  {
    id: 1,
    sender: 'Jean Mbourou',
    project: 'Résidence Okoumé',
    message: 'Coulage béton terminé pour le bloc A. RAS.',
    type: 'text',
    time: '10:45',
  },
  {
    id: 2,
    sender: 'Marie Ndong',
    project: 'Marina Bay',
    message: '📷 Photos progression chantier envoyées',
    type: 'image',
    time: '09:30',
  },
  {
    id: 3,
    sender: 'Pierre Ondo',
    project: 'Centre Commercial',
    message: '⚠️ Problème approvisionnement ciment',
    type: 'alert',
    time: '08:15',
  },
  {
    id: 4,
    sender: 'Sophie Ella',
    project: 'Résidence Okoumé',
    message: 'Équipe au complet ce matin. Début travaux toiture.',
    type: 'text',
    time: 'Hier',
  },
];

const typeConfig = {
  text: { icon: MessageSquare, color: 'text-blue-500' },
  image: { icon: Image, color: 'text-green-500' },
  alert: { icon: AlertTriangle, color: 'text-amber-500' },
};

export function FieldFeedWidget() {
  return (
    <div className="bg-white rounded-xl border h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Feed Terrain</h3>
          <p className="text-sm text-gray-500">Messages WhatsApp en direct</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600">Live</span>
        </div>
      </div>
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {mockFeed.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div key={item.id} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{item.sender}</span>
                  <span className="text-xs text-gray-400">• {item.time}</span>
                </div>
                <p className="text-xs text-primary mb-1">{item.project}</p>
                <div className="flex items-start gap-2">
                  <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                  <p className="text-sm text-gray-600">{item.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
