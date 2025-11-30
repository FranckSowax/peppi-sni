'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  RefreshCw,
  User,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  Package,
  Camera,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface WhatsAppMessage {
  id: string;
  sender_name: string;
  sender_phone: string;
  project_id: number | null;
  project_name: string | null;
  report_type: string | null;
  content: string;
  priority: string | null;  // Peut être null pour avancement/livraison
  photos: string[];
  status: 'nouveau' | 'lu' | 'traite';
  created_at: string;
  processed_at: string | null;
}

// Couleurs pour les priorités (uniquement pour les problèmes)
const getPriorityStyle = (priority: string | null) => {
  if (!priority) return null;
  const normalized = priority.toLowerCase();
  if (normalized.includes('haute') || normalized.includes('urgent') || normalized.includes('high')) {
    return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
  }
  if (normalized.includes('moyenne') || normalized.includes('medium') || normalized.includes('normal')) {
    return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
  }
  if (normalized.includes('basse') || normalized.includes('low') || normalized.includes('faible')) {
    return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
  }
  // Afficher la valeur brute avec un style par défaut
  return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
};

const statusConfig = {
  nouveau: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700' },
  lu: { label: 'Lu', color: 'bg-gray-100 text-gray-700' },
  traite: { label: 'Traité', color: 'bg-green-100 text-green-700' },
};

const reportTypeConfig: Record<string, { label: string; icon: typeof TrendingUp }> = {
  avancement: { label: 'Avancement', icon: TrendingUp },
  probleme: { label: 'Problème', icon: AlertCircle },
  livraison: { label: 'Livraison', icon: Package },
  photos: { label: 'Photos', icon: Camera },
  message: { label: 'Message', icon: MessageCircle },
};

export default function FeedPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const supabase = createClient();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.project_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || msg.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    const matchesType = filterType === 'all' || msg.report_type === filterType;
    return matchesSearch && matchesPriority && matchesStatus && matchesType;
  });

  const stats = {
    total: messages.length,
    nouveaux: messages.filter(m => m.status === 'nouveau').length,
    haute: messages.filter(m => m.priority === 'haute').length,
    withPhotos: messages.filter(m => m.photos && m.photos.length > 0).length,
  };

  const handleRefresh = () => {
    loadMessages();
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .update({ status: 'lu' })
        .eq('id', id);

      if (error) throw error;
      setMessages(msgs => msgs.map(m => 
        m.id === id ? { ...m, status: 'lu' as const } : m
      ));
      toast.success('Message marqué comme lu');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleMarkAsProcessed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .update({ status: 'traite', processed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setMessages(msgs => msgs.map(m => 
        m.id === id ? { ...m, status: 'traite' as const } : m
      ));
      toast.success('Message marqué comme traité');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const openLightbox = (photos: string[], index: number) => {
    setLightboxImage(photos[index]);
    setLightboxIndex(index);
  };

  const navigateLightbox = (direction: 'prev' | 'next', photos: string[]) => {
    const newIndex = direction === 'prev' 
      ? (lightboxIndex - 1 + photos.length) % photos.length
      : (lightboxIndex + 1) % photos.length;
    setLightboxIndex(newIndex);
    setLightboxImage(photos[newIndex]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Feed WhatsApp" subtitle="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Feed WhatsApp" 
        subtitle="Messages du chatbot ManyChat et communications terrain" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
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
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avec photos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.withPhotos}</p>
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Tous types</option>
                <option value="avancement">📊 Avancement</option>
                <option value="probleme">⚠️ Problème</option>
                <option value="livraison">📦 Livraison</option>
                <option value="photos">📸 Photos</option>
              </select>

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

              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des messages - Format Cards */}
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const priorityStyle = getPriorityStyle(msg.priority);
            const status = statusConfig[msg.status] || statusConfig.nouveau;
            const reportType = msg.report_type ? reportTypeConfig[msg.report_type] : null;
            const PriorityIcon = priorityStyle?.icon || Clock;
            const ReportIcon = reportType?.icon || MessageCircle;
            const hasPhotos = msg.photos && msg.photos.length > 0;
            const isProbleme = msg.report_type === 'probleme';
            const isHighPriority = msg.priority?.toLowerCase().includes('haute') || msg.priority?.toLowerCase().includes('urgent');

            return (
              <Card 
                key={msg.id}
                className={cn(
                  "overflow-hidden transition-all hover:shadow-lg",
                  msg.status === 'nouveau' && isProbleme && isHighPriority && "border-l-4 border-l-red-500",
                  msg.status === 'nouveau' && !isHighPriority && "border-l-4 border-l-blue-500"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-green-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{msg.sender_name}</h3>
                            <span className="text-sm text-gray-500">{msg.sender_phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(msg.created_at).toLocaleDateString('fr-FR')} à {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {msg.project_name && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {msg.project_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {reportType && (
                            <Badge variant="outline" className="text-xs">
                              <ReportIcon className="w-3 h-3 mr-1" />
                              {reportType.label}
                            </Badge>
                          )}
                          {/* Priorité affichée uniquement pour les problèmes */}
                          {isProbleme && msg.priority && priorityStyle && (
                            <Badge className={cn('border', priorityStyle.color)}>
                              <PriorityIcon className="w-3 h-3 mr-1" />
                              {msg.priority}
                            </Badge>
                          )}
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Message Content */}
                      <p className="text-gray-700 mb-3">{msg.content}</p>

                      {/* Photos Grid */}
                      {hasPhotos && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {msg.photos.length} photo(s) jointe(s)
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {msg.photos.map((photo, idx) => (
                              <button
                                key={idx}
                                onClick={() => openLightbox(msg.photos, idx)}
                                className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors group"
                              >
                                <Image
                                  src={photo}
                                  alt={`Photo ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t">
                        {msg.status === 'nouveau' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsRead(msg.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                        {msg.status !== 'traite' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleMarkAsProcessed(msg.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Traiter
                          </Button>
                        )}
                        {hasPhotos && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => openLightbox(msg.photos, 0)}
                          >
                            <ImageIcon className="w-4 h-4 mr-1" />
                            Voir les photos
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredMessages.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600">Aucun message</h3>
                <p className="text-gray-500">Les messages WhatsApp apparaîtront ici</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Lightbox pour les photos */}
      {lightboxImage && selectedMessage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          {selectedMessage.photos.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox('prev', selectedMessage.photos);
                }}
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
              <button
                className="absolute right-4 text-white hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox('next', selectedMessage.photos);
                }}
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            </>
          )}

          <div className="relative max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Photo agrandie"
              width={800}
              height={600}
              className="object-contain max-h-[80vh]"
              unoptimized
            />
            <p className="text-white text-center mt-4">
              {lightboxIndex + 1} / {selectedMessage.photos.length}
            </p>
          </div>
        </div>
      )}

      {/* Lightbox simple sans selectedMessage */}
      {lightboxImage && !selectedMessage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Photo agrandie"
              width={800}
              height={600}
              className="object-contain max-h-[80vh]"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
