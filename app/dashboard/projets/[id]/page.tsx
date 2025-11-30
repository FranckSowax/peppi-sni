'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Building2, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  ChevronRight,
  Play,
  Pause,
  BarChart3,
  Target,
  Truck,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data pour le projet
const projectData = {
  id: 1,
  name: 'Résidence Okoumé',
  description: 'Construction de 120 logements sociaux T2/T3/T4 dans le quartier résidentiel de Libreville. Ce projet phare de la SNI vise à offrir des logements de qualité à des prix accessibles.',
  region: 'Libreville',
  address: 'Boulevard Triomphal, Libreville',
  phase: 'construction',
  status: 'actif',
  progress: 75,
  budget: 5000000000,
  spent: 3750000000,
  startDate: '2024-01-15',
  endDate: '2025-06-30',
  manager: 'Jean Mbourou',
  managerPhone: '+241 77 XX XX XX',
  teamSize: 45,
  unitsTotal: 120,
  unitsSold: 85,
  unitsReserved: 20,
};

const kpis = [
  { label: 'Progression', value: '75%', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' },
  { label: 'Budget Consommé', value: '75%', icon: Wallet, color: 'text-primary', bgColor: 'bg-primary/10' },
  { label: 'Ventes', value: '85/120', icon: Target, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { label: 'Équipe', value: '45', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100' },
];

const progressData = [
  { month: 'Jan', progress: 10, budget: 500 },
  { month: 'Fév', progress: 20, budget: 800 },
  { month: 'Mar', progress: 32, budget: 1200 },
  { month: 'Avr', progress: 45, budget: 1800 },
  { month: 'Mai', progress: 55, budget: 2400 },
  { month: 'Jun', progress: 65, budget: 3000 },
  { month: 'Jul', progress: 75, budget: 3750 },
];

const chronogramme = [
  { phase: 'Études & Conception', start: '2024-01', end: '2024-03', progress: 100, status: 'completed' },
  { phase: 'Terrassement', start: '2024-03', end: '2024-04', progress: 100, status: 'completed' },
  { phase: 'Fondations', start: '2024-04', end: '2024-06', progress: 100, status: 'completed' },
  { phase: 'Gros Œuvre', start: '2024-06', end: '2024-12', progress: 85, status: 'in_progress' },
  { phase: 'Second Œuvre', start: '2024-10', end: '2025-03', progress: 40, status: 'in_progress' },
  { phase: 'Finitions', start: '2025-02', end: '2025-05', progress: 0, status: 'pending' },
  { phase: 'Livraison', start: '2025-05', end: '2025-06', progress: 0, status: 'pending' },
];

const documents = [
  { id: 1, name: 'Plan Architectural V3.pdf', type: 'pdf', size: '12.5 MB', date: '2024-01-20', category: 'Plans' },
  { id: 2, name: 'Contrat Entreprise Générale.pdf', type: 'pdf', size: '2.3 MB', date: '2024-01-15', category: 'Contrats' },
  { id: 3, name: 'Étude de Sol.pdf', type: 'pdf', size: '8.1 MB', date: '2023-12-10', category: 'Études' },
  { id: 4, name: 'Budget Prévisionnel 2024.xlsx', type: 'excel', size: '1.2 MB', date: '2024-01-05', category: 'Finance' },
  { id: 5, name: 'Planning Détaillé.xlsx', type: 'excel', size: '0.8 MB', date: '2024-02-01', category: 'Planning' },
];

const photos = [
  { id: 1, url: '/photo1.jpg', caption: 'Vue aérienne du chantier', date: '2024-07-28', sender: 'Jean Mbourou' },
  { id: 2, url: '/photo2.jpg', caption: 'Coulage béton Bloc A', date: '2024-07-27', sender: 'Marie Ndong' },
  { id: 3, url: '/photo3.jpg', caption: 'Ferraillage niveau 3', date: '2024-07-26', sender: 'Pierre Ondo' },
  { id: 4, url: '/photo4.jpg', caption: 'Livraison matériaux', date: '2024-07-25', sender: 'Jean Mbourou' },
  { id: 5, url: '/photo5.jpg', caption: 'Réunion de chantier', date: '2024-07-24', sender: 'Sophie Ella' },
  { id: 6, url: '/photo6.jpg', caption: 'Avancement façade', date: '2024-07-23', sender: 'Marie Ndong' },
];

const alerts = [
  { id: 1, title: 'Retard livraison ciment', severity: 'high', date: '2024-07-28', status: 'open' },
  { id: 2, title: 'Dépassement budget électricité', severity: 'medium', date: '2024-07-25', status: 'open' },
];

const recentMessages = [
  { id: 1, sender: 'Jean Mbourou', message: 'Coulage béton terminé pour le bloc A. RAS.', time: '10:45', type: 'text' },
  { id: 2, sender: 'Marie Ndong', message: '📷 Photos progression envoyées', time: '09:30', type: 'image' },
  { id: 3, sender: 'Pierre Ondo', message: 'Équipe au complet ce matin', time: '08:00', type: 'text' },
];

function formatCurrency(amount: number) {
  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(2) + ' Mds XAF';
  }
  return (amount / 1000000).toFixed(0) + ' M XAF';
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'photos' | 'chronogramme' | 'finance'>('overview');

  const tabs = [
    { id: 'overview', label: 'Vue générale', icon: BarChart3 },
    { id: 'chronogramme', label: 'Chronogramme', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'finance', label: 'Finance', icon: Wallet },
  ];

  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title={projectData.name}
        subtitle={`${projectData.region} • ${projectData.phase === 'construction' ? 'En construction' : projectData.phase}`}
      />
      
      <main className="p-6">
        {/* Retour + Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/projets">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux projets
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Button size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contacter l&apos;équipe
            </Button>
          </div>
        </div>

        {/* KPIs rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', kpi.bgColor)}>
                    <Icon className={cn('w-6 h-6', kpi.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alertes actives */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">{alerts.length} alerte(s) active(s)</span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between bg-white rounded p-2">
                    <span className="text-sm">{alert.title}</span>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      Traiter
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Graphique progression */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution du Projet</CardTitle>
                  <CardDescription>Progression et budget consommé</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="progress" name="Progression %" stroke="#f5821f" fill="#f5821f" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="budget" name="Budget (M)" stroke="#00529b" fill="#00529b" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Messages récents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        Messages Terrain
                      </CardTitle>
                      <CardDescription>Dernières remontées WhatsApp</CardDescription>
                    </div>
                    <Link href={`/dashboard/chantier?project=${params.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{msg.sender}</span>
                          <span className="text-xs text-gray-400">{msg.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Infos projet */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Localisation</p>
                      <p className="font-medium">{projectData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Période</p>
                      <p className="font-medium">
                        {new Date(projectData.startDate).toLocaleDateString('fr-FR')} - {new Date(projectData.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Chef de projet</p>
                      <p className="font-medium">{projectData.manager}</p>
                      <p className="text-xs text-gray-400">{projectData.managerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Unités</p>
                      <p className="font-medium">{projectData.unitsTotal} logements</p>
                      <p className="text-xs text-green-600">{projectData.unitsSold} vendus • {projectData.unitsReserved} réservés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photos récentes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Photos Récentes
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('photos')}>
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.slice(0, 6).map((photo) => (
                      <div key={photo.id} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'chronogramme' && (
          <Card>
            <CardHeader>
              <CardTitle>Chronogramme du Projet</CardTitle>
              <CardDescription>Planning des phases et jalons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chronogramme.map((phase, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-4">
                      {/* Indicateur */}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                        phase.status === 'completed' ? 'bg-green-100' :
                        phase.status === 'in_progress' ? 'bg-amber-100' : 'bg-gray-100'
                      )}>
                        {phase.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : phase.status === 'in_progress' ? (
                          <Play className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{phase.phase}</h4>
                          <span className="text-sm text-gray-500">
                            {phase.start} → {phase.end}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                phase.status === 'completed' ? 'bg-green-500' :
                                phase.status === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300'
                              )}
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">{phase.progress}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ligne de connexion */}
                    {index < chronogramme.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents du Projet</CardTitle>
                  <CardDescription>{documents.length} documents disponibles</CardDescription>
                </div>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        doc.type === 'pdf' ? 'bg-red-100' : 'bg-green-100'
                      )}>
                        <FileText className={cn(
                          'w-5 h-5',
                          doc.type === 'pdf' ? 'text-red-600' : 'text-green-600'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.category} • {doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'photos' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Galerie Photos</CardTitle>
                  <CardDescription>Photos terrain classées par date</CardDescription>
                </div>
                <Button>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">{photo.caption}</p>
                      <p className="text-xs text-gray-500">{photo.date} • {photo.sender}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Résumé Financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Budget Total</span>
                    <span className="font-bold">{formatCurrency(projectData.budget)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Dépensé</span>
                    <span className="font-bold text-primary">{formatCurrency(projectData.spent)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Disponible</span>
                    <span className="font-bold text-green-600">{formatCurrency(projectData.budget - projectData.spent)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                    <div
                      className="h-3 rounded-full bg-primary"
                      style={{ width: `${(projectData.spent / projectData.budget) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {((projectData.spent / projectData.budget) * 100).toFixed(1)}% du budget consommé
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventes & Réservations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Unités Vendues</p>
                    <p className="text-2xl font-bold text-green-600">{projectData.unitsSold}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Réservations</p>
                    <p className="text-2xl font-bold text-amber-600">{projectData.unitsReserved}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Disponibles</p>
                    <p className="text-2xl font-bold text-gray-600">
                      {projectData.unitsTotal - projectData.unitsSold - projectData.unitsReserved}
                    </p>
                  </div>
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
