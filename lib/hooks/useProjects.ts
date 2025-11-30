'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  region: string | null;
  phase: 'planification' | 'conception' | 'construction' | 'livraison' | 'termine';
  status: 'actif' | 'en_pause' | 'termine' | 'annule';
  progress: number;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  latitude: number | null;
  longitude: number | null;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  alertsCount?: number;
  spent?: number;
}

export interface ProjectWithDetails extends Project {
  alerts: Alert[];
  finances: Finance[];
  messages: ChantierMessage[];
}

export interface Alert {
  id: number;
  project_id: number | null;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Finance {
  id: number;
  project_id: number | null;
  type: 'budget' | 'expense' | 'invoice';
  category: string | null;
  amount: number;
  description: string | null;
  status: 'pending' | 'approved' | 'paid' | 'rejected' | null;
  record_date: string | null;
  created_at: string;
}

export interface ChantierMessage {
  id: number;
  project_id: number | null;
  sender: string;
  sender_phone: string | null;
  message_text: string | null;
  message_type: 'text' | 'image' | 'video' | 'document' | 'alert';
  media_url: string | null;
  received_at: string;
}

// Hook pour récupérer tous les projets
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const supabase = createClient();
        
        // Récupérer les projets
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (projectsError) throw projectsError;

        // Récupérer le nombre d'alertes par projet
        const { data: alertsData } = await supabase
          .from('alerts')
          .select('project_id')
          .eq('is_read', false);

        // Récupérer les dépenses par projet
        const { data: financesData } = await supabase
          .from('finances')
          .select('project_id, amount')
          .eq('type', 'expense');

        // Enrichir les projets avec les compteurs
        const enrichedProjects = (projectsData || []).map(project => {
          const alertsCount = (alertsData || []).filter(a => a.project_id === project.id).length;
          const spent = (financesData || [])
            .filter(f => f.project_id === project.id)
            .reduce((sum, f) => sum + (f.amount || 0), 0);

          return {
            ...project,
            alertsCount,
            spent,
          };
        });

        setProjects(enrichedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error, refetch: () => setLoading(true) };
}

// Hook pour récupérer un projet avec ses détails
export function useProject(projectId: number) {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      
      try {
        const supabase = createClient();
        
        // Récupérer le projet
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;

        // Récupérer les alertes du projet
        const { data: alertsData } = await supabase
          .from('alerts')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        // Récupérer les finances du projet
        const { data: financesData } = await supabase
          .from('finances')
          .select('*')
          .eq('project_id', projectId)
          .order('record_date', { ascending: false });

        // Récupérer les messages du projet
        const { data: messagesData } = await supabase
          .from('chantier_messages')
          .select('*')
          .eq('project_id', projectId)
          .order('received_at', { ascending: false })
          .limit(20);

        const spent = (financesData || [])
          .filter(f => f.type === 'expense')
          .reduce((sum, f) => sum + (f.amount || 0), 0);

        setProject({
          ...projectData,
          alertsCount: (alertsData || []).filter(a => !a.is_read).length,
          spent,
          alerts: alertsData || [],
          finances: financesData || [],
          messages: messagesData || [],
        });
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
}

// Hook pour récupérer les alertes
export function useAlerts(limit?: number) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const supabase = createClient();
        
        let query = supabase
          .from('alerts')
          .select('*')
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: alertsError } = await query;

        if (alertsError) throw alertsError;
        setAlerts(data || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, [limit]);

  return { alerts, loading, error };
}

// Hook pour récupérer les messages chantier
export function useChantierMessages(projectId?: number, limit?: number) {
  const [messages, setMessages] = useState<ChantierMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const supabase = createClient();
        
        let query = supabase
          .from('chantier_messages')
          .select('*')
          .order('received_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error: messagesError } = await query;

        if (messagesError) throw messagesError;
        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [projectId, limit]);

  return { messages, loading, error };
}

// Hook pour les stats du dashboard
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    unreadAlerts: 0,
    criticalAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient();
        
        // Projets
        const { data: projects } = await supabase
          .from('projects')
          .select('id, status, budget');

        // Alertes non lues
        const { data: alerts } = await supabase
          .from('alerts')
          .select('severity')
          .eq('is_read', false);

        // Dépenses
        const { data: expenses } = await supabase
          .from('finances')
          .select('amount')
          .eq('type', 'expense');

        const totalProjects = projects?.length || 0;
        const activeProjects = projects?.filter(p => p.status === 'actif').length || 0;
        const totalBudget = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
        const totalSpent = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const unreadAlerts = alerts?.length || 0;
        const criticalAlerts = alerts?.filter(a => a.severity === 'critical' || a.severity === 'high').length || 0;

        setStats({
          totalProjects,
          activeProjects,
          totalBudget,
          totalSpent,
          unreadAlerts,
          criticalAlerts,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
