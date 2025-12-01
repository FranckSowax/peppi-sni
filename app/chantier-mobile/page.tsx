'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  Hammer,
  Map,
  Loader2,
  X,
  Upload,
  Home,
  Bell,
  User,
  Plus,
  AlertCircle,
  Clock,
  Send,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';

// --- TYPES ---
interface Task {
  id: string;
  dbId?: number;
  name: string;
  unit: string;
  done: number;
  target: number;
  photos: number;
  photoUrls?: string[];
  hasAlert?: boolean;
  alertMessage?: string;
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
  chef: string;
}

interface Alert {
  id: string;
  taskId: string;
  taskName: string;
  type: 'blocage' | 'retard' | 'materiel' | 'securite';
  message: string;
  priority: 'haute' | 'moyenne' | 'basse';
  createdAt: Date;
  resolved: boolean;
}

// Données de démonstration par projet
const CHANTIERS_DATA: Record<number, { chantier: Chantier; series: Serie[] }> = {
  1: {
    chantier: { id: 1, name: 'Estuaire 1 - Lot 375', location: 'Libreville', progress: 45, status: 'on_track', chef: 'Jean Mbourou' },
    series: [
      {
        id: "100",
        title: "INSTALLATIONS DE CHANTIER",
        progress: 100,
        tasks: [
          { id: "101", name: "Installation de chantier", unit: "ff", done: 100, target: 100, photos: 2 },
        ]
      },
      {
        id: "200",
        title: "GROS ŒUVRE",
        progress: 45,
        tasks: [
          { id: "201", name: "Fouilles pour semelles", unit: "m3", done: 100, target: 100, photos: 3 },
          { id: "202", name: "Béton de propreté", unit: "m3", done: 100, target: 100, photos: 1 },
          { id: "203", name: "Semelles filantes BA", unit: "m3", done: 85, target: 100, photos: 2 },
          { id: "204", name: "Soubassement agglos 15cm", unit: "m2", done: 40, target: 100, photos: 1, hasAlert: true, alertMessage: "Manque de parpaings" },
          { id: "205", name: "Prépoteaux BA", unit: "m3", done: 30, target: 100, photos: 0 },
          { id: "206", name: "Remblai compacté", unit: "m3", done: 20, target: 100, photos: 0 },
          { id: "207", name: "Film polyane", unit: "m2", done: 0, target: 100, photos: 0 },
          { id: "208", name: "Dallage BA ép. 12cm", unit: "m3", done: 0, target: 100, photos: 0 },
        ]
      },
      {
        id: "300",
        title: "CHARPENTE & COUVERTURE",
        progress: 0,
        tasks: [
          { id: "301", name: "Fermes en bois traité", unit: "U", done: 0, target: 15, photos: 0 },
          { id: "302", name: "Pannes et chevrons", unit: "ml", done: 0, target: 200, photos: 0 },
          { id: "303", name: "Couverture tôles", unit: "m2", done: 0, target: 150, photos: 0 },
        ]
      },
    ]
  },
  2: {
    chantier: { id: 2, name: 'Résidence Okoumé', location: 'Owendo', progress: 75, status: 'on_track', chef: 'Marie Ndong' },
    series: [
      {
        id: "200",
        title: "GROS ŒUVRE",
        progress: 100,
        tasks: [
          { id: "201", name: "Fouilles", unit: "m3", done: 100, target: 100, photos: 5 },
          { id: "202", name: "Fondations", unit: "m3", done: 100, target: 100, photos: 4 },
          { id: "203", name: "Élévations", unit: "m2", done: 100, target: 100, photos: 6 },
        ]
      },
      {
        id: "400",
        title: "MENUISERIE",
        progress: 60,
        tasks: [
          { id: "401", name: "Portes intérieures", unit: "U", done: 80, target: 100, photos: 2 },
          { id: "402", name: "Fenêtres alu", unit: "U", done: 60, target: 100, photos: 1 },
          { id: "403", name: "Placards", unit: "U", done: 40, target: 100, photos: 0 },
        ]
      },
      {
        id: "500",
        title: "ÉLECTRICITÉ",
        progress: 50,
        tasks: [
          { id: "501", name: "Câblage", unit: "ml", done: 70, target: 100, photos: 1 },
          { id: "502", name: "Tableau électrique", unit: "U", done: 50, target: 100, photos: 0 },
          { id: "503", name: "Prises et interrupteurs", unit: "U", done: 30, target: 100, photos: 0 },
        ]
      },
    ]
  },
  3: {
    chantier: { id: 3, name: 'Marina Bay Phase 2', location: 'Port-Gentil', progress: 32, status: 'delayed', chef: 'Pierre Ondo' },
    series: [
      {
        id: "200",
        title: "GROS ŒUVRE",
        progress: 32,
        tasks: [
          { id: "201", name: "Terrassement", unit: "m3", done: 100, target: 100, photos: 3 },
          { id: "202", name: "Fondations profondes", unit: "ml", done: 50, target: 100, photos: 2, hasAlert: true, alertMessage: "Retard livraison béton" },
          { id: "203", name: "Radier", unit: "m2", done: 0, target: 100, photos: 0 },
        ]
      },
    ]
  },
  4: {
    chantier: { id: 4, name: 'Logements Sociaux Ntoum', location: 'Ntoum', progress: 60, status: 'ahead', chef: 'Sophie Ella' },
    series: [
      {
        id: "200",
        title: "GROS ŒUVRE",
        progress: 90,
        tasks: [
          { id: "201", name: "Fondations", unit: "m3", done: 100, target: 100, photos: 4 },
          { id: "202", name: "Élévations RDC", unit: "m2", done: 100, target: 100, photos: 5 },
          { id: "203", name: "Dalle haute", unit: "m2", done: 70, target: 100, photos: 2 },
        ]
      },
      {
        id: "300",
        title: "TOITURE",
        progress: 30,
        tasks: [
          { id: "301", name: "Charpente", unit: "m2", done: 50, target: 100, photos: 1 },
          { id: "302", name: "Couverture", unit: "m2", done: 10, target: 100, photos: 0 },
        ]
      },
    ]
  },
  5: {
    chantier: { id: 5, name: 'Centre Commercial Akanda', location: 'Akanda', progress: 90, status: 'on_track', chef: 'Paul Nzeng' },
    series: [
      {
        id: "200",
        title: "STRUCTURE",
        progress: 100,
        tasks: [
          { id: "201", name: "Ossature métallique", unit: "T", done: 100, target: 100, photos: 8 },
          { id: "202", name: "Planchers collaborants", unit: "m2", done: 100, target: 100, photos: 5 },
        ]
      },
      {
        id: "600",
        title: "FINITIONS",
        progress: 80,
        tasks: [
          { id: "601", name: "Cloisons", unit: "m2", done: 90, target: 100, photos: 3 },
          { id: "602", name: "Faux plafonds", unit: "m2", done: 80, target: 100, photos: 2 },
          { id: "603", name: "Peinture", unit: "m2", done: 70, target: 100, photos: 1 },
        ]
      },
    ]
  },
};

const ALERT_TYPES = [
  { value: 'blocage', label: 'Point bloquant', icon: AlertCircle, color: 'text-red-500' },
  { value: 'retard', label: 'Retard prévu', icon: Clock, color: 'text-orange-500' },
  { value: 'materiel', label: 'Manque matériel', icon: AlertTriangle, color: 'text-amber-500' },
  { value: 'securite', label: 'Sécurité', icon: AlertTriangle, color: 'text-red-600' },
];

function ChantierMobileContent() {
  const searchParams = useSearchParams();
  const chantierIdParam = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState<'taches' | 'alertes' | 'profil'>('taches');
  const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null);
  const [series, setSeries] = useState<Serie[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTask, setAlertTask] = useState<Task | null>(null);
  const [alertForm, setAlertForm] = useState({ type: 'blocage', message: '', priority: 'haute' });
  const [uploading, setUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoTask, setPhotoTask] = useState<Task | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les données du chantier depuis l'URL
  useEffect(() => {
    if (chantierIdParam) {
      const id = parseInt(chantierIdParam);
      const data = CHANTIERS_DATA[id];
      if (data) {
        setSelectedChantier(data.chantier);
        setSeries(data.series);
      }
    }
  }, [chantierIdParam]);

  // Mettre à jour l'avancement d'une tâche
  const updateTaskProgress = (serieId: string, taskId: string, newValue: number) => {
    setSeries(prev => prev.map(serie => {
      if (serie.id === serieId) {
        const updatedTasks = serie.tasks.map(task => 
          task.id === taskId ? { ...task, done: newValue } : task
        );
        const avgProgress = Math.round(updatedTasks.reduce((sum, t) => sum + t.done, 0) / updatedTasks.length);
        return { ...serie, tasks: updatedTasks, progress: avgProgress };
      }
      return serie;
    }));
    toast.success(`Avancement mis à jour: ${newValue}%`);
  };

  // Créer une alerte
  const createAlert = () => {
    if (!alertTask || !alertForm.message) return;
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      taskId: alertTask.id,
      taskName: alertTask.name,
      type: alertForm.type as Alert['type'],
      message: alertForm.message,
      priority: alertForm.priority as Alert['priority'],
      createdAt: new Date(),
      resolved: false,
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    
    // Marquer la tâche comme ayant une alerte
    setSeries(prev => prev.map(serie => ({
      ...serie,
      tasks: serie.tasks.map(task => 
        task.id === alertTask.id 
          ? { ...task, hasAlert: true, alertMessage: alertForm.message }
          : task
      )
    })));
    
    toast.success('Alerte créée et envoyée au directeur');
    setShowAlertModal(false);
    setAlertForm({ type: 'blocage', message: '', priority: 'haute' });
    setAlertTask(null);
  };

  // Gérer la sélection de photo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, task: Task) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoTask(task);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setShowPhotoModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload photo
  const uploadPhoto = async () => {
    if (!photoTask || !fileInputRef.current?.files?.[0]) return;
    
    setUploading(true);
    try {
      // Simuler l'upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSeries(prev => prev.map(serie => ({
        ...serie,
        tasks: serie.tasks.map(task => 
          task.id === photoTask.id 
            ? { ...task, photos: task.photos + 1, photoUrls: [...(task.photoUrls || []), photoPreview!] }
            : task
        )
      })));
      
      toast.success('Photo envoyée avec succès');
      setShowPhotoModal(false);
      setPhotoPreview(null);
      setPhotoTask(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setUploading(false);
    }
  };

  // Vue Tâches
  const TachesView = () => (
    <div className="p-4 pb-24">
      {!selectedChantier ? (
        // Message si pas de chantier sélectionné
        <div className="text-center py-12">
          <Hammer className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Aucun chantier sélectionné</h2>
          <p className="text-slate-500">Ouvrez cette page depuis le dashboard pour accéder aux tâches</p>
        </div>
      ) : (
        <>
          {!selectedSerie ? (
            // Liste des séries
            <div className="space-y-3">
              {series.map(serie => {
                const hasAlerts = serie.tasks.some(t => t.hasAlert);
                return (
                  <div 
                    key={serie.id}
                    onClick={() => setSelectedSerie(serie)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold",
                          serie.progress === 100 ? 'bg-emerald-100 text-emerald-600' :
                          serie.progress >= 50 ? 'bg-blue-100 text-blue-600' :
                          serie.progress > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                        )}>
                          {serie.progress}%
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{serie.title}</h3>
                          <p className="text-sm text-slate-500">{serie.tasks.length} tâches</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasAlerts && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        <ChevronRight className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Liste des tâches
            <div>
              <button 
                onClick={() => setSelectedSerie(null)}
                className="flex items-center gap-2 text-blue-600 mb-4"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Retour aux séries
              </button>
              
              <h2 className="text-lg font-bold text-slate-800 mb-4">{selectedSerie.title}</h2>
              
              <div className="space-y-3">
                {selectedSerie.tasks.map(task => (
                  <MobileTaskCard 
                    key={task.id}
                    task={task}
                    onProgressChange={(val) => updateTaskProgress(selectedSerie.id, task.id, val)}
                    onPhotoClick={() => {
                      setPhotoTask(task);
                      fileInputRef.current?.click();
                    }}
                    onAlertClick={() => {
                      setAlertTask(task);
                      setShowAlertModal(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Vue Alertes
  const AlertesView = () => (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Alertes</h1>
      <p className="text-slate-500 mb-6">{alerts.filter(a => !a.resolved).length} alertes actives</p>
      
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500">Aucune alerte pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const alertType = ALERT_TYPES.find(t => t.value === alert.type);
            const Icon = alertType?.icon || AlertTriangle;
            return (
              <div 
                key={alert.id}
                className={cn(
                  "bg-white rounded-2xl p-4 shadow-sm border-l-4",
                  alert.priority === 'haute' ? 'border-red-500' :
                  alert.priority === 'moyenne' ? 'border-orange-500' : 'border-yellow-500'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-full bg-slate-100", alertType?.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{alertType?.label}</h3>
                    <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Tâche: {alert.taskName}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Vue Profil
  const ProfilView = () => (
    <div className="p-4 pb-24">
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Jean Mbourou</h1>
        <p className="text-slate-500">Chef de chantier</p>
      </div>
      
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex justify-between">
          <span className="text-slate-500">Chantiers assignés</span>
          <span className="font-bold">2</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tâches complétées</span>
          <span className="font-bold text-emerald-600">12</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Photos envoyées</span>
          <span className="font-bold text-blue-600">28</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Alertes créées</span>
          <span className="font-bold text-orange-600">{alerts.length}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hammer className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">
                {selectedChantier ? selectedChantier.name : 'PEPPI Chantier'}
              </h1>
              <p className="text-blue-200 text-sm">
                {selectedChantier ? `${selectedChantier.location} • ${selectedChantier.chef}` : 'Mode Technicien'}
              </p>
            </div>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6" onClick={() => setActiveTab('alertes')} />
            {alerts.filter(a => !a.resolved).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                {alerts.filter(a => !a.resolved).length}
              </span>
            )}
          </div>
        </div>
        
        {/* Barre de progression du chantier */}
        {selectedChantier && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-200">Avancement global</span>
              <span className="font-bold">{selectedChantier.progress}%</span>
            </div>
            <div className="h-2 bg-blue-500 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${selectedChantier.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'taches' && <TachesView />}
        {activeTab === 'alertes' && <AlertesView />}
        {activeTab === 'profil' && <ProfilView />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around">
        {[
          { id: 'taches', icon: Hammer, label: 'Tâches' },
          { id: 'alertes', icon: Bell, label: 'Alertes' },
          { id: 'profil', icon: User, label: 'Profil' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex flex-col items-center py-2 px-4 rounded-xl transition-colors",
              activeTab === tab.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400'
            )}
          >
            <tab.icon className="w-6 h-6" />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => photoTask && handleFileSelect(e, photoTask)}
      />

      {/* Modal Alerte */}
      {showAlertModal && alertTask && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Signaler un problème</h3>
              <button onClick={() => setShowAlertModal(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-slate-500 mb-4">Tâche: {alertTask.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de problème</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALERT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setAlertForm(f => ({ ...f, type: type.value }))}
                      className={cn(
                        "p-3 rounded-xl border-2 flex items-center gap-2 transition-colors",
                        alertForm.type === type.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200'
                      )}
                    >
                      <type.icon className={cn("w-5 h-5", type.color)} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) => setAlertForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Décrivez le problème..."
                  className="w-full p-4 border border-slate-200 rounded-xl resize-none h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priorité</label>
                <div className="flex gap-2">
                  {['haute', 'moyenne', 'basse'].map(p => (
                    <button
                      key={p}
                      onClick={() => setAlertForm(f => ({ ...f, priority: p }))}
                      className={cn(
                        "flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-colors",
                        alertForm.priority === p 
                          ? p === 'haute' ? 'border-red-500 bg-red-50 text-red-600' :
                            p === 'moyenne' ? 'border-orange-500 bg-orange-50 text-orange-600' :
                            'border-yellow-500 bg-yellow-50 text-yellow-600'
                          : 'border-slate-200'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={createAlert}
                disabled={!alertForm.message}
                className="w-full py-4 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                Envoyer l&apos;alerte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Photo */}
      {showPhotoModal && photoPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={photoPreview} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          </div>
          <div className="p-4 flex gap-3">
            <button
              onClick={() => {
                setShowPhotoModal(false);
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="flex-1 py-4 bg-slate-700 text-white rounded-xl font-bold"
            >
              Annuler
            </button>
            <button
              onClick={uploadPhoto}
              disabled={uploading}
              className="flex-1 py-4 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Composant Carte de Tâche Mobile
function MobileTaskCard({ task, onProgressChange, onPhotoClick, onAlertClick }: {
  task: Task;
  onProgressChange: (val: number) => void;
  onPhotoClick: () => void;
  onAlertClick: () => void;
}) {
  const [val, setVal] = useState(task.done);

  const handleChange = (newVal: number) => {
    setVal(newVal);
    onProgressChange(newVal);
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl p-4 shadow-sm border",
      task.hasAlert ? 'border-red-200 bg-red-50/50' : 'border-slate-100'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              #{task.id}
            </span>
            {task.hasAlert && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <h4 className="font-semibold text-slate-800 mt-1">{task.name}</h4>
          <p className="text-xs text-slate-500">Unité: {task.unit}</p>
        </div>
        {val === 100 && (
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        )}
      </div>

      {task.hasAlert && task.alertMessage && (
        <div className="bg-red-100 text-red-700 text-sm p-2 rounded-lg mb-3">
          ⚠️ {task.alertMessage}
        </div>
      )}

      {/* Slider */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-bold mb-2">
          <span className="text-slate-600">Avancement</span>
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
          className="w-full h-4 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={onPhotoClick}
          className={cn(
            "flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors",
            task.photos > 0 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-slate-100 text-slate-600'
          )}
        >
          <Camera className="w-5 h-5" />
          {task.photos > 0 ? `${task.photos} photos` : 'Photo'}
        </button>
        <button 
          onClick={onAlertClick}
          className="flex-1 py-3 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center gap-2 font-medium"
        >
          <AlertTriangle className="w-5 h-5" />
          Signaler
        </button>
      </div>
    </div>
  );
}

// Wrapper avec Suspense pour useSearchParams
export default function ChantierMobilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Chargement...</p>
        </div>
      </div>
    }>
      <ChantierMobileContent />
    </Suspense>
  );
}
