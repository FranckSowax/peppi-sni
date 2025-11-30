'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: number;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
}

const mockAlerts: Alert[] = [
  {
    id: 1,
    title: 'Retard livraison matériaux',
    message: 'Projet Résidence Okoumé - Livraison retardée de 5 jours',
    severity: 'critical',
    time: 'Il y a 2h',
  },
  {
    id: 2,
    title: 'Budget dépassé',
    message: 'Projet Marina Bay - Dépassement de 15% sur le poste électricité',
    severity: 'high',
    time: 'Il y a 4h',
  },
  {
    id: 3,
    title: 'Nouveau message terrain',
    message: 'Équipe Chantier Nord - Photos de progression envoyées',
    severity: 'low',
    time: 'Il y a 6h',
  },
];

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    borderColor: 'border-l-red-500',
  },
  high: {
    icon: AlertCircle,
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-l-orange-500',
  },
  medium: {
    icon: Info,
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    borderColor: 'border-l-yellow-500',
  },
  low: {
    icon: CheckCircle,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-l-blue-500',
  },
};

export function AlertsWidget() {
  return (
    <div className="bg-white rounded-xl border h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Alertes Prioritaires</h3>
        <p className="text-sm text-gray-500">Notifications importantes</p>
      </div>
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {mockAlerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={cn(
                'p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow',
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
