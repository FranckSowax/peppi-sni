'use client';

import { AlertTriangle, AlertCircle, Info, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlerts } from '@/lib/hooks/useProjects';

// Fonction pour formater le temps relatif
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

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
  const { alerts, loading } = useAlerts(10);
  const unreadAlerts = alerts.filter(a => !a.is_read);

  return (
    <div className="bg-white rounded-xl border h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Alertes Prioritaires</h3>
          <p className="text-sm text-gray-500">{unreadAlerts.length} non lue(s)</p>
        </div>
        {unreadAlerts.length > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            {unreadAlerts.length}
          </span>
        )}
      </div>
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Aucune alerte</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const severity = alert.severity as keyof typeof severityConfig;
            const config = severityConfig[severity] || severityConfig.medium;
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-sm transition-shadow',
                  config.bgColor,
                  config.borderColor,
                  alert.is_read && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(alert.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
