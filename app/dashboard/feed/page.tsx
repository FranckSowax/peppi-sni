'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Filter,
  RefreshCw,
  User,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface WhatsAppMessage {
  id: string;
  sender_name: string;
  sender_phone: string;
  project_id: number | null;
  project_name: string | null;
  content: string;
  priority: 'haute' | 'moyenne' | 'basse';
  status: 'nouveau' | 'lu' | 'traite';
  created_at: string;
}

// Données de démonstration
const demoMessages: WhatsAppMessage[] = [
  {
    id: '1',
    sender_name: 'Jean Mbourou',
    sender_phone: '+241 77 12 34 56',
    project_id: 1,
    project_name: 'Résidence Les Palmiers',
    content: 'Bonjour, le béton est arrivé sur le chantier. Nous commençons le coulage du 3ème étage demain matin.',
    priority: 'haute',
    status: 'nouveau',
    created_at: '2024-01-20T08:30:00Z'
  },
  {
    id: '2',
    sender_name: 'Marie Nguema',
    sender_phone: '+241 66 98 76 54',
    project_id: 2,
    project_name: 'Centre Commercial Oloumi',
    content: 'Problème avec la livraison des carreaux. Le fournisseur annonce un retard de 2 semaines.',
    priority: 'haute',
    status: 'nouveau',
    created_at: '2024-01-20T09:15:00Z'
  },
  {
    id: '3',
    sender_name: 'Pierre Ondo',
    sender_phone: '+241 74 55 66 77',
    project_id: 3,
    project_name: 'Logements Sociaux Nzeng-Ayong',
    content: 'Les travaux de plomberie du bloc A sont terminés. Inspection prévue vendredi.',
    priority: 'moyenne',
    status: 'lu',
    created_at: '2024-01-19T16:45:00Z'
  },
  {
    id: '4',
    sender_name: 'Sophie Mba',
    sender_phone: '+241 62 33 44 55',
    project_id: 1,
    project_name: 'Résidence Les Palmiers',
    content: 'Demande de validation pour les modifications électriques du penthouse.',
    priority: 'moyenne',
    status: 'traite',
    created_at: '2024-01-19T14:20:00Z'
  },
  {
    id: '5',
    sender_name: 'Paul Essono',
    sender_phone: '+241 77 88 99 00',
    project_id: 4,
    project_name: 'Bureaux Ministériels',
    content: 'RAS sur le chantier. Avancement conforme au planning.',
    priority: 'basse',
    status: 'lu',
    created_at: '2024-01-19T11:00:00Z'
  },
  {
    id: '6',
    sender_name: 'Alice Obame',
    sender_phone: '+241 65 11 22 33',
    project_id: 5,
    project_name: 'École Primaire Akébé',
    content: 'Urgent: Fuite d\'eau détectée dans les fondations. Intervention nécessaire.',
    priority: 'haute',
    status: 'nouveau',
    created_at: '2024-01-20T07:00:00Z'
  },
];

const priorityConfig = {
  haute: { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
  moyenne: { label: 'Moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  basse: { label: 'Basse', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
};

const statusConfig = {
  nouveau: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700' },
  lu: { label: 'Lu', color: 'bg-gray-100 text-gray-700' },
  traite: { label: 'Traité', color: 'bg-green-100 text-green-700' },
};

export default function FeedPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>(demoMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.project_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const stats = {
    total: messages.length,
    nouveaux: messages.filter(m => m.status === 'nouveau').length,
    haute: messages.filter(m => m.priority === 'haute').length,
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleMarkAsRead = (id: string) => {
    setMessages(msgs => msgs.map(m => 
      m.id === id ? { ...m, status: 'lu' as const } : m
    ));
  };

  const handleMarkAsProcessed = (id: string) => {
    setMessages(msgs => msgs.map(m => 
      m.id === id ? { ...m, status: 'traite' as const } : m
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Feed WhatsApp" 
        subtitle="Messages du chatbot et communications terrain" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total messages</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Non lus</p>
                <p className="text-2xl font-bold text-blue-600">{stats.nouveaux}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Priorité haute</p>
                <p className="text-2xl font-bold text-red-600">{stats.haute}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par expéditeur, projet ou contenu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Toutes priorités</option>
                <option value="haute">🔴 Haute</option>
                <option value="moyenne">🟡 Moyenne</option>
                <option value="basse">🟢 Basse</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Tous statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="lu">Lu</option>
                <option value="traite">Traité</option>
              </select>

              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des messages */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-600 w-36">Date</th>
                    <th className="text-left p-4 font-medium text-gray-600 w-40">Expéditeur</th>
                    <th className="text-left p-4 font-medium text-gray-600 w-48">Projet</th>
                    <th className="text-left p-4 font-medium text-gray-600">Message</th>
                    <th className="text-left p-4 font-medium text-gray-600 w-28">Priorité</th>
                    <th className="text-left p-4 font-medium text-gray-600 w-28">Statut</th>
                    <th className="text-left p-4 font-medium text-gray-600 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => {
                    const priority = priorityConfig[msg.priority];
                    const status = statusConfig[msg.status];
                    const PriorityIcon = priority.icon;
                    const isExpanded = expandedMessage === msg.id;

                    return (
                      <tr 
                        key={msg.id} 
                        className={cn(
                          "border-b last:border-0 hover:bg-gray-50 transition-colors",
                          msg.status === 'nouveau' && "bg-blue-50/50"
                        )}
                      >
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="font-medium">
                              {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{msg.sender_name}</p>
                              <p className="text-xs text-gray-500">{msg.sender_phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {msg.project_name ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{msg.project_name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className={cn(
                            "text-sm",
                            isExpanded ? "" : "line-clamp-2"
                          )}>
                            {msg.content}
                          </p>
                          {msg.content.length > 100 && (
                            <button
                              onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                              className="text-xs text-primary hover:underline mt-1"
                            >
                              {isExpanded ? 'Réduire' : 'Voir plus'}
                            </button>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={cn('border', priority.color)}>
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {priority.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {msg.status === 'nouveau' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleMarkAsRead(msg.id)}
                              >
                                Lu
                              </Button>
                            )}
                            {msg.status !== 'traite' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-green-600"
                                onClick={() => handleMarkAsProcessed(msg.id)}
                              >
                                ✓
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucun message trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
