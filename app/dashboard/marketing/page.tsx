'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Megaphone, 
  Plus,
  Search,
  Calendar,
  Target,
  Users,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  type: 'social' | 'email' | 'print' | 'event';
  status: 'draft' | 'active' | 'completed' | 'paused';
  project_id: number | null;
  project_name: string | null;
  target_audience: string;
  budget: number;
  start_date: string;
  end_date: string | null;
  reach: number;
  conversions: number;
  description: string;
}

interface MarketingRequest {
  id: string;
  title: string;
  type: 'visuel' | 'video' | 'brochure' | 'affiche' | 'autre';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  project_name: string | null;
  requester: string;
  deadline: string;
  description: string;
  created_at: string;
}

// Données de démonstration
const demoCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Lancement Résidence Les Palmiers',
    type: 'social',
    status: 'active',
    project_id: 1,
    project_name: 'Résidence Les Palmiers',
    target_audience: 'Cadres supérieurs, Expatriés',
    budget: 5000000,
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    reach: 45000,
    conversions: 120,
    description: 'Campagne de lancement sur les réseaux sociaux pour la commercialisation des appartements.'
  },
  {
    id: '2',
    name: 'Portes Ouvertes Oloumi',
    type: 'event',
    status: 'draft',
    project_id: 2,
    project_name: 'Centre Commercial Oloumi',
    target_audience: 'Investisseurs, Commerçants',
    budget: 15000000,
    start_date: '2024-02-20',
    end_date: '2024-02-22',
    reach: 0,
    conversions: 0,
    description: 'Événement portes ouvertes pour présenter les espaces commerciaux disponibles.'
  },
  {
    id: '3',
    name: 'Newsletter Logements Sociaux',
    type: 'email',
    status: 'completed',
    project_id: 3,
    project_name: 'Logements Sociaux Nzeng-Ayong',
    target_audience: 'Fonctionnaires, Familles',
    budget: 500000,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    reach: 12000,
    conversions: 350,
    description: 'Campagne email pour informer sur les conditions d\'accès aux logements sociaux.'
  },
];

const demoRequests: MarketingRequest[] = [
  {
    id: '1',
    title: 'Visuels 3D appartements T3',
    type: 'visuel',
    status: 'in_progress',
    project_name: 'Résidence Les Palmiers',
    requester: 'Direction Commerciale',
    deadline: '2024-01-25',
    description: 'Création de 5 visuels 3D pour les appartements T3 avec vue mer.',
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: '2',
    title: 'Brochure commerciale Centre Oloumi',
    type: 'brochure',
    status: 'pending',
    project_name: 'Centre Commercial Oloumi',
    requester: 'Direction Générale',
    deadline: '2024-02-10',
    description: 'Brochure 16 pages présentant le centre commercial et les espaces disponibles.',
    created_at: '2024-01-19T14:30:00Z'
  },
  {
    id: '3',
    title: 'Affiche événement portes ouvertes',
    type: 'affiche',
    status: 'completed',
    project_name: 'Centre Commercial Oloumi',
    requester: 'Service Communication',
    deadline: '2024-02-15',
    description: 'Affiche A2 pour l\'événement portes ouvertes.',
    created_at: '2024-01-15T09:00:00Z'
  },
];

const campaignTypeConfig = {
  social: { label: 'Réseaux sociaux', color: 'bg-blue-100 text-blue-700' },
  email: { label: 'Email', color: 'bg-green-100 text-green-700' },
  print: { label: 'Print', color: 'bg-purple-100 text-purple-700' },
  event: { label: 'Événement', color: 'bg-amber-100 text-amber-700' },
};

const campaignStatusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: Edit2 },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: 'Terminée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  paused: { label: 'En pause', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

const requestTypeConfig = {
  visuel: { label: 'Visuel', icon: ImageIcon },
  video: { label: 'Vidéo', icon: Eye },
  brochure: { label: 'Brochure', icon: FileText },
  affiche: { label: 'Affiche', icon: ImageIcon },
  autre: { label: 'Autre', icon: FileText },
};

const requestStatusConfig = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'requests'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>(demoCampaigns);
  const [requests, setRequests] = useState<MarketingRequest[]>(demoRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newRequest, setNewRequest] = useState({
    title: '',
    type: 'visuel',
    project_name: '',
    deadline: '',
    description: ''
  });

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.project_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.project_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
  };

  const handleSubmitRequest = () => {
    if (!newRequest.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const request: MarketingRequest = {
        id: Date.now().toString(),
        title: newRequest.title,
        type: newRequest.type as MarketingRequest['type'],
        status: 'pending',
        project_name: newRequest.project_name || null,
        requester: 'Utilisateur',
        deadline: newRequest.deadline,
        description: newRequest.description,
        created_at: new Date().toISOString()
      };
      setRequests([request, ...requests]);
      setNewRequest({ title: '', type: 'visuel', project_name: '', deadline: '', description: '' });
      setShowNewRequest(false);
      setSaving(false);
      toast.success('Demande soumise');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Marketing" 
        subtitle="Campagnes et demandes de supports marketing" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Campagnes actives</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Portée totale</p>
                <p className="text-2xl font-bold text-blue-600">{(stats.totalReach / 1000).toFixed(0)}k</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Demandes en attente</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingRequests}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget total</p>
                <p className="text-2xl font-bold text-purple-600">{(stats.totalBudget / 1000000).toFixed(1)}M</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'campaigns' ? 'default' : 'outline'}
            onClick={() => setActiveTab('campaigns')}
          >
            <Megaphone className="w-4 h-4 mr-2" />
            Campagnes
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('requests')}
          >
            <Send className="w-4 h-4 mr-2" />
            Demandes
            {stats.pendingRequests > 0 && (
              <Badge className="ml-2 bg-amber-500">{stats.pendingRequests}</Badge>
            )}
          </Button>
        </div>

        {/* Barre de recherche */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {activeTab === 'requests' && (
                <Button onClick={() => setShowNewRequest(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle demande
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire nouvelle demande */}
        {showNewRequest && activeTab === 'requests' && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Nouvelle demande marketing
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowNewRequest(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Titre *</Label>
                  <Input
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="Ex: Visuels 3D pour appartements"
                  />
                </div>
                <div>
                  <Label>Type de support</Label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="visuel">🖼️ Visuel</option>
                    <option value="video">🎬 Vidéo</option>
                    <option value="brochure">📄 Brochure</option>
                    <option value="affiche">📌 Affiche</option>
                    <option value="autre">📎 Autre</option>
                  </select>
                </div>
                <div>
                  <Label>Date limite</Label>
                  <Input
                    type="date"
                    value={newRequest.deadline}
                    onChange={(e) => setNewRequest({ ...newRequest, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Projet concerné (optionnel)</Label>
                  <Input
                    value={newRequest.project_name}
                    onChange={(e) => setNewRequest({ ...newRequest, project_name: e.target.value })}
                    placeholder="Nom du projet"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Décrivez votre besoin en détail..."
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmitRequest} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Soumettre
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenu selon l'onglet */}
        {activeTab === 'campaigns' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign) => {
              const type = campaignTypeConfig[campaign.type];
              const status = campaignStatusConfig[campaign.status];
              const StatusIcon = status.icon;

              return (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={cn("h-2", 
                    campaign.status === 'active' ? 'bg-green-500' :
                    campaign.status === 'draft' ? 'bg-gray-400' :
                    campaign.status === 'completed' ? 'bg-blue-500' : 'bg-amber-500'
                  )} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold line-clamp-2">{campaign.name}</h3>
                      <Badge className={status.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{campaign.description}</p>

                    <div className="space-y-2 text-sm">
                      {campaign.project_name && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Target className="w-4 h-4" />
                          {campaign.project_name}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(campaign.start_date).toLocaleDateString('fr-FR')}
                        {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString('fr-FR')}`}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        {campaign.target_audience}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Portée</p>
                        <p className="font-semibold">{campaign.reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Conversions</p>
                        <p className="font-semibold">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Budget</p>
                        <p className="font-semibold">{(campaign.budget / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>

                    <Badge className={cn("mt-3", type.color)}>{type.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}

            {filteredCampaigns.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Megaphone className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucune campagne trouvée</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const type = requestTypeConfig[request.type];
              const status = requestStatusConfig[request.status];
              const TypeIcon = type.icon;

              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{request.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {type.label}
                          </span>
                          {request.project_name && (
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {request.project_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Deadline: {new Date(request.deadline).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {request.requester}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune demande trouvée</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
