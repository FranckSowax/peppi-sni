'use client';

import { MessageSquare, Image, AlertTriangle, User, Loader2, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChantierMessages } from '@/lib/hooks/useProjects';

const typeConfig = {
  text: { icon: MessageSquare, color: 'text-blue-500' },
  image: { icon: Image, color: 'text-green-500' },
  video: { icon: Video, color: 'text-purple-500' },
  document: { icon: FileText, color: 'text-gray-500' },
  alert: { icon: AlertTriangle, color: 'text-amber-500' },
};

// Fonction pour formater l'heure
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier';
  }
  
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function FieldFeedWidget() {
  const { messages, loading } = useChantierMessages(undefined, 10);

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucun message</p>
          </div>
        ) : (
          messages.map((item) => {
            const msgType = item.message_type as keyof typeof typeConfig;
            const config = typeConfig[msgType] || typeConfig.text;
            const Icon = config.icon;
            return (
              <div key={item.id} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{item.sender}</span>
                    <span className="text-xs text-gray-400">• {formatTime(item.received_at)}</span>
                  </div>
                  <p className="text-xs text-primary mb-1">Projet #{item.project_id}</p>
                  <div className="flex items-start gap-2">
                    <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', config.color)} />
                    <p className="text-sm text-gray-600">{item.message_text || 'Média envoyé'}</p>
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
