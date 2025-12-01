'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// --- TYPES ---
interface Task {
  id: string;
  name: string;
  unit: string;
  done: number;
  target: number;
  photos: number;
}

interface Serie {
  id: string;
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

  // Ajouter une photo à une tâche
  const addPhoto = (serieId: string, taskId: string) => {
    setData(prev => {
      const newData = { ...prev };
      const serie = newData[activeTab].find(s => s.id === serieId);
      if (serie) {
        const task = serie.tasks.find(t => t.id === taskId);
        if (task) {
          task.photos += 1;
        }
      }
      return newData;
    });
    toast.success('Photo ajoutée avec succès');
    setHasChanges(true);
  };

  // Sauvegarder le rapport
  const saveReport = () => {
    toast.success('Rapport sauvegardé avec succès');
    setHasChanges(false);
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
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sélectionnez un chantier</h2>
            <p className="text-gray-500">Cliquez sur une carte pour accéder au suivi détaillé</p>
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

        {/* Liste des Séries (Accordéon) */}
        <div className="space-y-4">
          {data[activeTab].map((serie) => (
            <div key={serie.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              {/* Header de Série */}
              <div 
                onClick={() => setExpandedSerie(expandedSerie === serie.id ? null : serie.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg",
                    serie.progress === 100 ? 'bg-green-100 text-green-600' :
                    serie.progress >= 50 ? 'bg-blue-100 text-blue-600' :
                    serie.progress > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                  )}>
                    {serie.progress}%
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{serie.title}</h3>
                    <p className="text-sm text-slate-500">{serie.tasks.length} tâches • {serie.tasks.filter(t => t.done === 100).length} terminées</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">{serie.tasks.reduce((s, t) => s + t.photos, 0)} photos</span>
                  </div>
                  {expandedSerie === serie.id ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
                </div>
              </div>

              {/* Liste des Tâches */}
              {expandedSerie === serie.id && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
                  {serie.tasks.map((task) => (
                    <TaskRow 
                      key={task.id} 
                      task={task} 
                      onProgressChange={(val) => updateTaskProgress(serie.id, task.id, val)}
                      onAddPhoto={() => addPhoto(serie.id, task.id)}
                    />
                  ))}
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
    </div>
  );
}

// --- COMPOSANTS AUXILIAIRES ---

function TaskRow({ task, onProgressChange, onAddPhoto }: { 
  task: Task; 
  onProgressChange: (val: number) => void;
  onAddPhoto: () => void;
}) {
  const [val, setVal] = useState(task.done);
  
  const handleChange = (newVal: number) => {
    setVal(newVal);
    onProgressChange(newVal);
  };

  const getProgressColor = (v: number) => {
    if (v === 0) return 'bg-slate-200';
    if (v < 50) return 'bg-orange-400';
    if (v < 100) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        
        {/* Info Tâche */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">#{task.id}</span>
            <h4 className="font-semibold text-slate-800 truncate">{task.name}</h4>
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
        <div className="flex items-center gap-3">
          <button 
            onClick={onAddPhoto}
            className={cn(
              "p-3 rounded-lg border flex items-center gap-2 transition-colors",
              task.photos > 0 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700' 
                : 'border-slate-200 hover:bg-slate-50 text-slate-500'
            )}
          >
            <Camera size={18} />
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
        </div>
      </div>
    </div>
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
