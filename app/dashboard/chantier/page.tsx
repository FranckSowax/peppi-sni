'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Hammer,
  Map,
  Save,
  Building2,
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Loader2,
  X,
  Upload,
  Edit3,
  Copy,
  Trash2,
  GripVertical,
  Settings,
  Bell,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// --- TYPES ---
interface Task {
  id: string;
  dbId?: number; // ID en base de données
  name: string;
  unit: string;
  done: number;
  target: number;
  photos: number;
  photoUrls?: string[];
}

interface Serie {
  id: string;
  dbId?: number;
  title: string;
  progress: number;
  tasks: Task[];
}

interface Chantier {
  id: number;
  name: string;
  location: string;
  progress: number;
  status: 'on_track' | 'delayed' | 'ahead';
  lastUpdate: string;
  chef: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

interface Alert {
  id: string;
  taskId: string;
  taskName: string;
  serieName: string;
  type: 'blocage' | 'retard' | 'materiel' | 'securite';
  message: string;
  priority: 'haute' | 'moyenne' | 'basse';
  createdAt: Date;
  resolved: boolean;
  chantierId: number;
}

const ALERT_TYPES = [
  { value: 'blocage', label: 'Point bloquant', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'retard', label: 'Retard prévu', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'materiel', label: 'Manque matériel', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'securite', label: 'Sécurité', color: 'bg-red-100 text-red-800 border-red-300' },
];

const UNIT_OPTIONS = ['m2', 'm3', 'ml', 'U', 'ff', 'Ft', 'kg', 'L', 'jour'];

// --- DONNÉES DES CHANTIERS ---
const CHANTIERS: Chantier[] = [
  { id: 1, name: 'Estuaire 1 - Lot 375', location: 'Libreville', progress: 45, status: 'on_track', lastUpdate: 'Il y a 2h', chef: 'Jean Mbourou' },
  { id: 2, name: 'Résidence Okoumé', location: 'Owendo', progress: 75, status: 'on_track', lastUpdate: 'Il y a 4h', chef: 'Marie Ndong' },
  { id: 3, name: 'Marina Bay Phase 2', location: 'Port-Gentil', progress: 32, status: 'delayed', lastUpdate: 'Hier', chef: 'Pierre Ondo' },
  { id: 4, name: 'Logements Sociaux Ntoum', location: 'Ntoum', progress: 60, status: 'ahead', lastUpdate: 'Il y a 1h', chef: 'Sophie Ella' },
  { id: 5, name: 'Centre Commercial Akanda', location: 'Akanda', progress: 90, status: 'on_track', lastUpdate: 'Il y a 30min', chef: 'Paul Nzeng' },
];

// --- DONNÉES EXTRAITES DU FICHIER EXCEL (TDR APPLICATION DE SUIVI) ---
const INITIAL_DATA: { logement: Serie[]; parcelle: Serie[] } = {
  logement: [
    {
      id: "100",
      title: "SERIE 100: INSTALLATIONS DE CHANTIER",
      progress: 100,
      tasks: [
        { id: "101", name: "Installation de chantier", unit: "ff", done: 100, target: 100, photos: 2 },
      ]
    },
    {
      id: "200",
      title: "SERIE 200: GROS ŒUVRE",
      progress: 45,
      tasks: [
        { id: "201", name: "Fouilles pour semelles filantes", unit: "m3", done: 100, target: 100, photos: 3 },
        { id: "202", name: "Béton de propreté dosé à 150kg/m3", unit: "m3", done: 100, target: 100, photos: 1 },
        { id: "203", name: "Semelles filantes en béton armé dosé à 350kg/m3", unit: "m3", done: 85, target: 100, photos: 2 },
        { id: "204", name: "Soubassement en agglomérés de 15 cm", unit: "m2", done: 40, target: 100, photos: 1 },
        { id: "205", name: "Prépoteaux en béton armé incorporés", unit: "m3", done: 30, target: 100, photos: 0 },
        { id: "206", name: "Remblai compacté sous dallage", unit: "m3", done: 20, target: 100, photos: 0 },
        { id: "207", name: "Film polyane sous dallage", unit: "m2", done: 0, target: 100, photos: 0 },
        { id: "208", name: "Dallage en béton armé ép. 12cm", unit: "m3", done: 0, target: 100, photos: 0 },
        { id: "209", name: "Élévation en agglomérés de 15 cm", unit: "m2", done: 0, target: 100, photos: 0 },
        { id: "210", name: "Poteaux en béton armé", unit: "m3", done: 0, target: 100, photos: 0 },
        { id: "211", name: "Chaînage horizontal en béton armé", unit: "ml", done: 0, target: 100, photos: 0 },
        { id: "212", name: "Linteaux en béton armé", unit: "ml", done: 0, target: 100, photos: 0 },
      ]
    },
    {
      id: "300",
      title: "SERIE 300: CHARPENTE & COUVERTURE",
      progress: 0,
      tasks: [
        { id: "301", name: "Fermes en bois traité", unit: "U", done: 0, target: 15, photos: 0 },
        { id: "302", name: "Pannes et chevrons", unit: "ml", done: 0, target: 200, photos: 0 },
        { id: "303", name: "Couverture en tôles bac alu", unit: "m2", done: 0, target: 100, photos: 0 },
        { id: "304", name: "Faîtière et rives", unit: "ml", done: 0, target: 50, photos: 0 },
        { id: "305", name: "Gouttières et descentes EP", unit: "ml", done: 0, target: 40, photos: 0 },
      ]
    },
    {
      id: "400",
      title: "SERIE 400: MENUISERIE",
      progress: 0,
      tasks: [
        { id: "401", name: "Portes extérieures métalliques", unit: "U", done: 0, target: 3, photos: 0 },
        { id: "402", name: "Portes intérieures en bois", unit: "U", done: 0, target: 6, photos: 0 },
        { id: "403", name: "Fenêtres aluminium vitrées", unit: "U", done: 0, target: 8, photos: 0 },
        { id: "404", name: "Grilles de protection", unit: "U", done: 0, target: 8, photos: 0 },
      ]
    },
    {
      id: "500",
      title: "SERIE 500: ÉLECTRICITÉ",
      progress: 0,
      tasks: [
        { id: "501", name: "Tableau électrique principal", unit: "U", done: 0, target: 1, photos: 0 },
        { id: "502", name: "Points lumineux", unit: "U", done: 0, target: 12, photos: 0 },
        { id: "503", name: "Prises de courant", unit: "U", done: 0, target: 15, photos: 0 },
        { id: "504", name: "Interrupteurs", unit: "U", done: 0, target: 8, photos: 0 },
      ]
    },
    {
      id: "600",
      title: "SERIE 600: PLOMBERIE",
      progress: 0,
      tasks: [
        { id: "601", name: "Alimentation eau froide", unit: "ml", done: 0, target: 30, photos: 0 },
        { id: "602", name: "Évacuation PVC", unit: "ml", done: 0, target: 25, photos: 0 },
        { id: "603", name: "WC complet", unit: "U", done: 0, target: 2, photos: 0 },
        { id: "604", name: "Lavabo avec robinetterie", unit: "U", done: 0, target: 2, photos: 0 },
        { id: "605", name: "Évier cuisine", unit: "U", done: 0, target: 1, photos: 0 },
      ]
    },
    {
      id: "700",
      title: "SERIE 700: REVÊTEMENTS & FINITIONS",
      progress: 0,
      tasks: [
        { id: "701", name: "Enduit ciment sur murs", unit: "m2", done: 0, target: 150, photos: 0 },
        { id: "702", name: "Carrelage sol", unit: "m2", done: 0, target: 60, photos: 0 },
        { id: "703", name: "Faïence murale", unit: "m2", done: 0, target: 20, photos: 0 },
        { id: "704", name: "Peinture intérieure", unit: "m2", done: 0, target: 200, photos: 0 },
        { id: "705", name: "Peinture extérieure", unit: "m2", done: 0, target: 80, photos: 0 },
      ]
    },
  ],
  parcelle: [
    {
      id: "000",
      title: "000 - INSTALLATION DE CHANTIER",
      progress: 100,
      tasks: [
        { id: "001", name: "Installation de chantier, amenée et repli du matériel", unit: "Ft", done: 100, target: 100, photos: 1 },
        { id: "002", name: "Études Géotechniques (projet d'Exécution)", unit: "Ft", done: 100, target: 100, photos: 2 },
      ]
    },
    {
      id: "100",
      title: "100 - TRAVAUX PRÉPARATOIRES",
      progress: 60,
      tasks: [
        { id: "101", name: "Nettoyage sans essouchement avec évacuation", unit: "m2", done: 100, target: 100, photos: 3 },
        { id: "102", name: "Décapage terre végétale ép. 20cm", unit: "m2", done: 80, target: 100, photos: 2 },
        { id: "103", name: "Déblais en terrain meuble", unit: "m3", done: 50, target: 100, photos: 1 },
        { id: "104", name: "Remblais d'apport latéritique", unit: "m3", done: 30, target: 100, photos: 0 },
      ]
    },
    {
      id: "200",
      title: "200 - VOIRIE ET RÉSEAUX DIVERS",
      progress: 20,
      tasks: [
        { id: "201", name: "Réseau pluvial - Caniveaux", unit: "ml", done: 40, target: 150, photos: 1 },
        { id: "202", name: "Réseau pluvial - Regards", unit: "U", done: 2, target: 8, photos: 0 },
        { id: "203", name: "Voirie - Couche de fondation", unit: "m2", done: 0, target: 500, photos: 0 },
        { id: "204", name: "Voirie - Revêtement bicouche", unit: "m2", done: 0, target: 500, photos: 0 },
        { id: "205", name: "Bordures de trottoir", unit: "ml", done: 0, target: 200, photos: 0 },
      ]
    },
    {
      id: "300",
      title: "300 - ESPACES VERTS",
      progress: 0,
      tasks: [
        { id: "301", name: "Engazonnement", unit: "m2", done: 0, target: 300, photos: 0 },
        { id: "302", name: "Plantation d'arbres", unit: "U", done: 0, target: 20, photos: 0 },
        { id: "303", name: "Arrosage automatique", unit: "Ft", done: 0, target: 100, photos: 0 },
      ]
    },
  ]
};

const statusConfig = {
  on_track: { label: 'Dans les temps', color: 'bg-green-100 text-green-700' },
  delayed: { label: 'En retard', color: 'bg-red-100 text-red-700' },
  ahead: { label: 'En avance', color: 'bg-blue-100 text-blue-700' },
};

// --- COMPOSANT PRINCIPAL ---
export default function ChantierPage() {
  const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);
  const [activeTab, setActiveTab] = useState<'logement' | 'parcelle'>('logement');
  const [expandedSerie, setExpandedSerie] = useState<string | null>("200");
  const [data, setData] = useState(INITIAL_DATA);
  const [hasChanges, setHasChanges] = useState(false);
  
  // États pour l'édition
  const [editingSerieId, setEditingSerieId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showAddSerieModal, setShowAddSerieModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState<string | null>(null);
  const [newSerie, setNewSerie] = useState({ id: '', title: '' });
  const [newTask, setNewTask] = useState({ id: '', name: '', unit: 'm2', target: 100 });
  
  // États pour les alertes
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);

  // Mise à jour de l'avancement d'une tâche
  const updateTaskProgress = (serieId: string, taskId: string, newValue: number) => {
    setData(prev => {
      const newData = { ...prev };
      const serie = newData[activeTab].find(s => s.id === serieId);
      if (serie) {
        const task = serie.tasks.find(t => t.id === taskId);
        if (task) {
          task.done = newValue;
          // Recalculer le progrès de la série
          const totalProgress = serie.tasks.reduce((sum, t) => sum + t.done, 0);
          serie.progress = Math.round(totalProgress / serie.tasks.length);
        }
      }
      return newData;
    });
    setHasChanges(true);
  };

  // Ajouter une URL de photo à une tâche (après upload réussi)
  const addPhotoUrl = (serieId: string, taskId: string, photoUrl: string) => {
    setData(prev => {
      const newData = { ...prev };
      const serie = newData[activeTab].find(s => s.id === serieId);
      if (serie) {
        const task = serie.tasks.find(t => t.id === taskId);
        if (task) {
          task.photos += 1;
          if (!task.photoUrls) task.photoUrls = [];
          task.photoUrls.push(photoUrl);
        }
      }
      return newData;
    });
    setHasChanges(true);
  };

  // Sauvegarder le rapport
  const saveReport = () => {
    toast.success('Rapport sauvegardé avec succès');
    setHasChanges(false);
  };

  // Ajouter une nouvelle série
  const addSerie = () => {
    if (!newSerie.id || !newSerie.title) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    const serie: Serie = {
      id: newSerie.id,
      title: newSerie.title,
      progress: 0,
      tasks: [],
    };
    
    setData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], serie],
    }));
    
    setNewSerie({ id: '', title: '' });
    setShowAddSerieModal(false);
    setHasChanges(true);
    toast.success('Série ajoutée avec succès');
  };

  // Dupliquer une série
  const duplicateSerie = (serieId: string) => {
    const serie = data[activeTab].find(s => s.id === serieId);
    if (!serie) return;
    
    const newId = `${serie.id}-copy-${Date.now()}`;
    const duplicated: Serie = {
      ...serie,
      id: newId,
      title: `${serie.title} (copie)`,
      progress: 0,
      tasks: serie.tasks.map(t => ({
        ...t,
        id: `${t.id}-copy`,
        done: 0,
        photos: 0,
        photoUrls: [],
      })),
    };
    
    setData(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], duplicated],
    }));
    
    setHasChanges(true);
    toast.success('Série dupliquée avec succès');
  };

  // Supprimer une série
  const deleteSerie = (serieId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette série et toutes ses tâches ?')) return;
    
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(s => s.id !== serieId),
    }));
    
    setHasChanges(true);
    toast.success('Série supprimée');
  };

  // Modifier le titre d'une série
  const updateSerieTitle = (serieId: string, newTitle: string) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(s => 
        s.id === serieId ? { ...s, title: newTitle } : s
      ),
    }));
    setEditingSerieId(null);
    setHasChanges(true);
  };

  // Ajouter une tâche à une série
  const addTask = (serieId: string) => {
    if (!newTask.id || !newTask.name) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    const task: Task = {
      id: newTask.id,
      name: newTask.name,
      unit: newTask.unit,
      target: newTask.target,
      done: 0,
      photos: 0,
    };
    
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(s => 
        s.id === serieId ? { ...s, tasks: [...s.tasks, task] } : s
      ),
    }));
    
    setNewTask({ id: '', name: '', unit: 'm2', target: 100 });
    setShowAddTaskModal(null);
    setHasChanges(true);
    toast.success('Tâche ajoutée avec succès');
  };

  // Supprimer une tâche
  const deleteTask = (serieId: string, taskId: string) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(s => 
        s.id === serieId 
          ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
          : s
      ),
    }));
    
    setHasChanges(true);
    toast.success('Tâche supprimée');
  };

  // Modifier une tâche
  const updateTask = (serieId: string, taskId: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(s => 
        s.id === serieId 
          ? { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t) }
          : s
      ),
    }));
    setEditingTaskId(null);
    setHasChanges(true);
  };

  // Démarrer un projet vide
  const startEmptyProject = () => {
    setData({
      logement: [],
      parcelle: [],
    });
    toast.success('Projet vide créé - Ajoutez vos séries et tâches');
  };

  // Calculer les stats globales
  const calculateStats = () => {
    const currentData = data[activeTab];
    const totalTasks = currentData.reduce((sum, s) => sum + s.tasks.length, 0);
    const completedTasks = currentData.reduce((sum, s) => 
      sum + s.tasks.filter(t => t.done === 100).length, 0);
    const totalPhotos = currentData.reduce((sum, s) => 
      sum + s.tasks.reduce((ps, t) => ps + t.photos, 0), 0);
    const globalProgress = currentData.reduce((sum, s) => sum + s.progress, 0) / currentData.length;
    
    return { totalTasks, completedTasks, totalPhotos, globalProgress: Math.round(globalProgress) };
  };

  const stats = calculateStats();

  // Vue liste des chantiers
  if (!selectedChantier) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader title="Chantier 360°" />
        
        <div className="flex-1 p-6 overflow-auto">
          {/* Barre d'actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">Sélectionnez un chantier</h2>
              <p className="text-gray-500">Cliquez sur une carte pour accéder au suivi détaillé</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/chantier-mobile" 
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                Mode Technicien
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowAlertsPanel(true)}
                className="relative"
              >
                <Bell className="w-4 h-4 mr-2" />
                Alertes
                {alerts.filter(a => !a.resolved).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.filter(a => !a.resolved).length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHANTIERS.map((chantier) => {
              const status = statusConfig[chantier.status];
              return (
                <Card 
                  key={chantier.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-l-4"
                  style={{ borderLeftColor: chantier.status === 'delayed' ? '#ef4444' : chantier.status === 'ahead' ? '#3b82f6' : '#22c55e' }}
                  onClick={() => setSelectedChantier(chantier)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{chantier.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Map className="w-3 h-3" /> {chantier.location}
                        </p>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Avancement global</span>
                        <span className="font-bold">{chantier.progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            chantier.progress >= 80 ? "bg-green-500" :
                            chantier.progress >= 50 ? "bg-blue-500" :
                            chantier.progress >= 30 ? "bg-amber-500" : "bg-red-500"
                          )}
                          style={{ width: `${chantier.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Chef: {chantier.chef}</span>
                      <span className="text-gray-400">{chantier.lastUpdate}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Carte d'ajout */}
            <Card className="cursor-pointer hover:shadow-lg transition-all border-dashed border-2 flex items-center justify-center min-h-[200px]">
              <CardContent className="text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Ajouter un chantier</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Vue détail d'un chantier
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSelectedChantier(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                <Hammer className="text-orange-500" size={28} />
                {selectedChantier.name}
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Map className="w-4 h-4" /> {selectedChantier.location} • Chef: {selectedChantier.chef}
              </p>
            </div>
          </div>
          
          {/* Onglets */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('logement')}
              className={cn(
                "px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2",
                activeTab === 'logement' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-white'
              )}
            >
              <Building2 size={18} /> Construction Logement
            </button>
            <button 
              onClick={() => setActiveTab('parcelle')}
              className={cn(
                "px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2",
                activeTab === 'parcelle' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-white'
              )}
            >
              <Map size={18} /> Aménagement Parcelle
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Avancement Global" 
            value={`${stats.globalProgress}%`}
            trend={`${stats.completedTasks}/${stats.totalTasks} tâches`}
            icon={<TrendingUp />} 
            color="blue" 
          />
          <StatCard 
            title="Tâches Terminées" 
            value={stats.completedTasks.toString()}
            trend={`sur ${stats.totalTasks} total`}
            icon={<CheckCircle2 />} 
            color="emerald" 
          />
          <StatCard 
            title="Photos Collectées" 
            value={stats.totalPhotos.toString()}
            trend="Preuves visuelles"
            icon={<Camera />} 
            color="purple" 
          />
          <StatCard 
            title="Points Bloquants" 
            value="1"
            trend="Approvisionnement"
            icon={<AlertTriangle />} 
            color="red" 
          />
        </div>

        {/* Bouton Ajouter Série */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-700">Séries de tâches</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startEmptyProject}>
              <Trash2 className="w-4 h-4 mr-2" />
              Projet vide
            </Button>
            <Button size="sm" onClick={() => setShowAddSerieModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle série
            </Button>
          </div>
        </div>

        {/* Liste des Séries (Accordéon) */}
        <div className="space-y-4">
          {data[activeTab].length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
              <Plus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">Aucune série</h3>
              <p className="text-slate-500 mb-4">Commencez par ajouter une série de tâches</p>
              <Button onClick={() => setShowAddSerieModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une série
              </Button>
            </div>
          ) : data[activeTab].map((serie) => (
            <div key={serie.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Header de Série */}
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div 
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => setExpandedSerie(expandedSerie === serie.id ? null : serie.id)}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg",
                    serie.progress === 100 ? "bg-green-100 text-green-600" :
                    serie.progress >= 50 ? "bg-blue-100 text-blue-600" :
                    serie.progress > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {serie.progress}%
                  </div>
                  <div>
                    {editingSerieId === serie.id ? (
                      <Input
                        defaultValue={serie.title}
                        className="font-bold"
                        onBlur={(e) => updateSerieTitle(serie.id, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && updateSerieTitle(serie.id, (e.target as HTMLInputElement).value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="text-lg font-bold text-slate-800">{serie.title}</h3>
                    )}
                    <p className="text-sm text-slate-500">{serie.tasks.length} tâches - {serie.tasks.filter(t => t.done === 100).length} terminées</p>
                  </div>
                </div>
                
                {/* Actions de série */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingSerieId(serie.id); }}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicateSerie(serie.id); }}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSerie(serie.id); }}
                    className="p-2 hover:bg-red-100 rounded-lg text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="hidden md:flex items-center gap-2 ml-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">{serie.tasks.reduce((s, t) => s + t.photos, 0)}</span>
                  </div>
                  {expandedSerie === serie.id ? <ChevronUp className="text-slate-400 ml-2"/> : <ChevronDown className="text-slate-400 ml-2"/>}
                </div>
              </div>

              {/* Liste des Tâches */}
              {expandedSerie === serie.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  {serie.tasks.map((task) => (
                    <TaskRow 
                      key={task.id} 
                      task={task}
                      chantierId={selectedChantier.id}
                      onProgressChange={(val) => updateTaskProgress(serie.id, task.id, val)}
                      onPhotoUploaded={(url) => addPhotoUrl(serie.id, task.id, url)}
                      onDelete={() => deleteTask(serie.id, task.id)}
                      onUpdate={(updates) => updateTask(serie.id, task.id, updates)}
                    />
                  ))}
                  
                  {/* Bouton Ajouter Tâche */}
                  <button
                    onClick={() => setShowAddTaskModal(serie.id)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une tâche
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bouton Flottant */}
      {hasChanges && (
        <div className="fixed bottom-8 right-8">
          <Button 
            onClick={saveReport}
            className="bg-slate-900 text-white px-6 py-6 rounded-full shadow-2xl flex items-center gap-3 font-bold hover:scale-105 transition-transform"
          >
            <Save size={20} />
            Sauvegarder Rapport
          </Button>
        </div>
      )}

      {/* Modal Ajouter Série */}
      {showAddSerieModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nouvelle série</h3>
              <button onClick={() => setShowAddSerieModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code série</label>
                <Input
                  placeholder="Ex: 800"
                  value={newSerie.id}
                  onChange={(e) => setNewSerie(s => ({ ...s, id: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <Input
                  placeholder="Ex: SERIE 800: PISCINE"
                  value={newSerie.title}
                  onChange={(e) => setNewSerie(s => ({ ...s, title: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddSerieModal(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={addSerie}>
                  Créer la série
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajouter Tâche */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Nouvelle tâche</h3>
              <button onClick={() => setShowAddTaskModal(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code tâche</label>
                <Input
                  placeholder="Ex: 801"
                  value={newTask.id}
                  onChange={(e) => setNewTask(t => ({ ...t, id: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la tâche</label>
                <Input
                  placeholder="Ex: Excavation piscine"
                  value={newTask.name}
                  onChange={(e) => setNewTask(t => ({ ...t, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unité</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={newTask.unit}
                    onChange={(e) => setNewTask(t => ({ ...t, unit: e.target.value }))}
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objectif</label>
                  <Input
                    type="number"
                    value={newTask.target}
                    onChange={(e) => setNewTask(t => ({ ...t, target: parseInt(e.target.value) || 100 }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddTaskModal(null)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={() => addTask(showAddTaskModal)}>
                  Ajouter la tâche
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel Alertes */}
      {showAlertsPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Alertes terrain
                </h3>
                <button onClick={() => setShowAlertsPanel(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {alerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                  <p className="text-slate-500">Aucune alerte pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map(alert => {
                    const alertType = ALERT_TYPES.find(t => t.value === alert.type);
                    return (
                      <div 
                        key={alert.id}
                        className={cn(
                          "p-4 rounded-xl border",
                          alertType?.color || "bg-slate-100"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-bold">{alertType?.label}</span>
                          <Badge variant={alert.priority === "haute" ? "destructive" : "secondary"}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <p className="text-xs text-slate-500">
                          Tâche: {alert.taskName} - {alert.serieName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(alert.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPOSANTS AUXILIAIRES ---

function TaskRow({ task, chantierId, onProgressChange, onPhotoUploaded, onDelete, onUpdate }: { 
  task: Task;
  chantierId: number;
  onProgressChange: (val: number) => void;
  onPhotoUploaded: (url: string) => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}) {
  const [val, setVal] = useState(task.done);
  const [uploading, setUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editUnit, setEditUnit] = useState(task.unit);
  const [editTarget, setEditTarget] = useState(task.target);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (newVal: number) => {
    setVal(newVal);
    onProgressChange(newVal);
  };

  const saveEdit = () => {
    onUpdate({ name: editName, unit: editUnit, target: editTarget });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(task.name);
    setEditUnit(task.unit);
    setEditTarget(task.target);
    setIsEditing(false);
  };

  const getProgressColor = (v: number) => {
    if (v === 0) return 'bg-slate-200';
    if (v < 50) return 'bg-orange-400';
    if (v < 100) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setShowPhotoModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', task.dbId?.toString() || task.id);
      formData.append('chantierId', chantierId.toString());
      formData.append('takenBy', 'Technicien');

      const response = await fetch('/api/chantier/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Photo uploadée avec succès');
        onPhotoUploaded(data.url);
        setShowPhotoModal(false);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {isEditing ? (
          // Mode édition
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{task.id}</span>
              <span className="text-xs text-blue-600 font-medium">Mode édition</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Nom de la tâche</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Unité</label>
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Objectif</label>
                  <input
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(parseInt(e.target.value) || 100)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          // Mode affichage
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            
            {/* Info Tâche */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{task.id}</span>
                <h4 className="font-semibold text-slate-800 truncate">{task.name}</h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"
                  title="Modifier"
                >
                  <Edit3 size={14} />
                </button>
              </div>
              <div className="text-xs text-slate-500">Unité: {task.unit} • Objectif: {task.target}</div>
            </div>

            {/* Slider d'avancement */}
            <div className="flex-1 w-full lg:max-w-xs">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                <span>Avancement</span>
                <span className={cn(
                  val === 100 ? "text-emerald-600" : val >= 50 ? "text-blue-600" : "text-slate-600"
                )}>{val}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={val} 
                onChange={(e) => handleChange(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-300", getProgressColor(val))} 
                  style={{width: `${val}%`}}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "p-3 rounded-lg border flex items-center gap-2 transition-colors",
                  task.photos > 0 
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500',
                  uploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                <span className="text-xs font-bold">{task.photos > 0 ? `${task.photos}` : '+'}</span>
              </button>
              
              {val === 100 ? (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <span className="text-xs font-bold">{val}%</span>
                </div>
              )}
              
              {/* Bouton supprimer */}
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-100 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                title="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Miniatures des photos existantes */}
        {task.photoUrls && task.photoUrls.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {task.photoUrls.map((url, idx) => (
                <img 
                  key={idx}
                  src={url} 
                  alt={`Photo ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de prévisualisation photo */}
      {showPhotoModal && photoPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Confirmer la photo</h3>
              <button 
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <img 
                src={photoPreview} 
                alt="Preview" 
                className="w-full h-64 object-contain rounded-lg bg-slate-100"
              />
              <p className="text-sm text-slate-500 mt-2 text-center">
                Tâche: {task.name}
              </p>
            </div>
            <div className="p-4 border-t flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowPhotoModal(false);
                  setPhotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1"
                onClick={uploadPhoto}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ title, value, trend, icon, color }: {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'red' | 'purple';
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-slate-500 font-medium text-xs">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
          </div>
          <div className={cn("p-2 rounded-xl", colorClasses[color])}>
            {icon}
          </div>
        </div>
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", colorClasses[color])}>
          {trend}
        </span>
      </CardContent>
    </Card>
  );
}
