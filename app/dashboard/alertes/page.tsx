'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Search, 
  Plus,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Bot,
  User,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'ia' | 'manuel';
  severity: 'critique' | 'important' | 'info';
  status: 'active' | 'resolved' | 'dismissed';
  project_id: number | null;
  project_name: string | null;
  created_at: string;
  resolved_at: string | null;
}

// Données de démonstration
const demoAlerts: Alert[] = [
  {
    id: '1',
    title: 'Retard critique sur le coulage béton',
    description: 'L\'IA a détecté un retard de 5 jours sur le planning du coulage béton du 3ème étage. Impact potentiel sur la date de livraison.',
    type: 'ia',
    severity: 'critique',
    status: 'active',
    project_id: 1,
    project_name: 'Résidence Les Palmiers',
    created_at: '2024-01-20T08:00:00Z',
    resolved_at: null
  },
  {
    id: '2',
    title: 'Dépassement budgétaire détecté',
    description: 'Les dépenses du mois dépassent de 15% le budget prévu pour les matériaux de finition.',
    type: 'ia',
    severity: 'important',
    status: 'active',
    project_id: 2,
    project_name: 'Centre Commercial Oloumi',
    created_at: '2024-01-19T14:30:00Z',
    resolved_at: null
  },
  {
    id: '3',
    title: 'Inspection sécurité requise',
    description: 'Rappel: L\'inspection de sécurité trimestrielle doit être effectuée avant le 25 janvier.',
    type: 'manuel',
    severity: 'important',
    status: 'active',
    project_id: 3,
    project_name: 'Logements Sociaux Nzeng-Ayong',
    created_at: '2024-01-18T10:00:00Z',
    resolved_at: null
  },
  {
    id: '4',
    title: 'Stock de ciment bas',
    description: 'Le niveau de stock de ciment est inférieur au seuil minimum. Commander dans les 48h.',
    type: 'ia',
    severity: 'info',
    status: 'resolved',
    project_id: 1,
    project_name: 'Résidence Les Palmiers',
    created_at: '2024-01-15T09:00:00Z',
    resolved_at: '2024-01-16T11:00:00Z'
  },
  {
    id: '5',
    title: 'Conditions météo défavorables',
    description: 'Prévisions de fortes pluies pour les 3 prochains jours. Adapter le planning des travaux extérieurs.',
    type: 'ia',
    severity: 'info',
    status: 'dismissed',
    project_id: null,
    project_name: null,
    created_at: '2024-01-17T06:00:00Z',
    resolved_at: null
  },
];

const severityConfig = {
  critique: { label: 'Critique', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  important: { label: 'Important', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
  info: { label: 'Info', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Bell },
};

const statusConfig = {
  active: { label: 'Active', color: 'bg-red-100 text-red-700' },
  resolved: { label: 'Résolue', color: 'bg-green-100 text-green-700' },
  dismissed: { label: 'Ignorée', color: 'bg-gray-100 text-gray-700' },
};

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    severity: 'important',
    project_name: ''
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.project_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = {
    total: alerts.filter(a => a.status === 'active').length,
    critiques: alerts.filter(a => a.severity === 'critique' && a.status === 'active').length,
    ia: alerts.filter(a => a.type === 'ia' && a.status === 'active').length,
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, status: 'resolved' as const, resolved_at: new Date().toISOString() } : a
    ));
    toast.success('Alerte marquée comme résolue');
  };

  const handleDismiss = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, status: 'dismissed' as const } : a
    ));
    toast.info('Alerte ignorée');
  };

  const handleAddAlert = () => {
    if (!newAlert.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const alert: Alert = {
        id: Date.now().toString(),
        title: newAlert.title,
        description: newAlert.description,
        type: 'manuel',
        severity: newAlert.severity as 'critique' | 'important' | 'info',
        status: 'active',
        project_id: null,
        project_name: newAlert.project_name || null,
        created_at: new Date().toISOString(),
        resolved_at: null
      };
      setAlerts([alert, ...alerts]);
      setNewAlert({ title: '', description: '', severity: 'important', project_name: '' });
      setShowAddAlert(false);
      setSaving(false);
      toast.success('Alerte créée');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Alertes" 
        subtitle="Alertes IA et notifications manuelles" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Alertes actives</p>
                <p className="text-2xl font-bold text-red-600">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Critiques</p>
                <p className="text-2xl font-bold text-amber-600">{stats.critiques}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Détectées par IA</p>
                <p className="text-2xl font-bold text-purple-600">{stats.ia}</p>
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
                  placeholder="Rechercher une alerte..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Toutes sévérités</option>
                <option value="critique">🔴 Critique</option>
                <option value="important">🟡 Important</option>
                <option value="info">🔵 Info</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">Tous statuts</option>
                <option value="active">Active</option>
                <option value="resolved">Résolue</option>
                <option value="dismissed">Ignorée</option>
              </select>

              <Button onClick={() => setShowAddAlert(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle alerte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire nouvelle alerte */}
        {showAddAlert && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Créer une alerte manuelle
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddAlert(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Titre *</Label>
                  <Input
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    placeholder="Ex: Inspection requise sur le chantier"
                  />
                </div>
                <div>
                  <Label>Sévérité</Label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="critique">🔴 Critique</option>
                    <option value="important">🟡 Important</option>
                    <option value="info">🔵 Info</option>
                  </select>
                </div>
                <div>
                  <Label>Projet (optionnel)</Label>
                  <Input
                    value={newAlert.project_name}
                    onChange={(e) => setNewAlert({ ...newAlert, project_name: e.target.value })}
                    placeholder="Nom du projet concerné"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                    placeholder="Détails de l'alerte..."
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddAlert(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddAlert} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Créer l&apos;alerte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des alertes */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const severity = severityConfig[alert.severity];
            const status = statusConfig[alert.status];
            const SeverityIcon = severity.icon;

            return (
              <Card 
                key={alert.id}
                className={cn(
                  "overflow-hidden transition-all",
                  alert.status === 'active' && alert.severity === 'critique' && "border-l-4 border-l-red-500"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      alert.severity === 'critique' ? 'bg-red-100' :
                      alert.severity === 'important' ? 'bg-amber-100' : 'bg-blue-100'
                    )}>
                      <SeverityIcon className={cn(
                        "w-5 h-5",
                        alert.severity === 'critique' ? 'text-red-600' :
                        alert.severity === 'important' ? 'text-amber-600' : 'text-blue-600'
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{alert.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={cn('border', severity.color)}>
                            {severity.label}
                          </Badge>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          {alert.type === 'ia' ? (
                            <>
                              <Bot className="w-4 h-4" />
                              Détectée par IA
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4" />
                              Manuelle
                            </>
                          )}
                        </span>
                        {alert.project_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {alert.project_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      {alert.status === 'active' && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" onClick={() => handleResolve(alert.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Résoudre
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDismiss(alert.id)}>
                            <BellOff className="w-4 h-4 mr-1" />
                            Ignorer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredAlerts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucune alerte trouvée</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
