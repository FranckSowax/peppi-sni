export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 
  | 'admin'
  | 'direction_generale'
  | 'chef_projet'
  | 'equipe_terrain'
  | 'finance'
  | 'commercial';

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          region: string | null;
          phase: string | null;
          status: string;
          manager_id: string | null;
          latitude: number | null;
          longitude: number | null;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          region?: string | null;
          phase?: string | null;
          status?: string;
          manager_id?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          region?: string | null;
          phase?: string | null;
          status?: string;
          manager_id?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      strategie_kpis: {
        Row: {
          id: number;
          project_id: number;
          kpi_name: string;
          target_value: number | null;
          current_value: number | null;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          kpi_name: string;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          kpi_name?: string;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          updated_at?: string;
        };
      };
      action_plans: {
        Row: {
          id: number;
          project_id: number;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      supply_orders: {
        Row: {
          id: number;
          project_id: number;
          supplier: string;
          item: string;
          quantity: number;
          unit_price: number | null;
          total_price: number | null;
          status: string;
          order_date: string | null;
          delivery_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          supplier: string;
          item: string;
          quantity: number;
          unit_price?: number | null;
          total_price?: number | null;
          status?: string;
          order_date?: string | null;
          delivery_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          supplier?: string;
          item?: string;
          quantity?: number;
          unit_price?: number | null;
          total_price?: number | null;
          status?: string;
          order_date?: string | null;
          delivery_date?: string | null;
          created_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: number;
          project_id: number;
          item_name: string;
          quantity_on_hand: number;
          min_quantity: number;
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          item_name: string;
          quantity_on_hand?: number;
          min_quantity?: number;
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          item_name?: string;
          quantity_on_hand?: number;
          min_quantity?: number;
          unit?: string | null;
          updated_at?: string;
        };
      };
      chantier_messages: {
        Row: {
          id: number;
          project_id: number;
          sender: string;
          sender_phone: string | null;
          message_text: string | null;
          message_type: string;
          media_url: string | null;
          received_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          sender: string;
          sender_phone?: string | null;
          message_text?: string | null;
          message_type?: string;
          media_url?: string | null;
          received_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          sender?: string;
          sender_phone?: string | null;
          message_text?: string | null;
          message_type?: string;
          media_url?: string | null;
          received_at?: string;
        };
      };
      finances: {
        Row: {
          id: number;
          project_id: number;
          type: 'budget' | 'expense' | 'invoice';
          category: string | null;
          amount: number;
          currency: string;
          description: string | null;
          status: string | null;
          record_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          type: 'budget' | 'expense' | 'invoice';
          category?: string | null;
          amount: number;
          currency?: string;
          description?: string | null;
          status?: string | null;
          record_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          type?: 'budget' | 'expense' | 'invoice';
          category?: string | null;
          amount?: number;
          currency?: string;
          description?: string | null;
          status?: string | null;
          record_date?: string;
          created_at?: string;
        };
      };
      commercial_activities: {
        Row: {
          id: number;
          project_id: number;
          activity_type: 'lead' | 'reservation' | 'payment' | 'pipeline';
          client_name: string | null;
          client_email: string | null;
          client_phone: string | null;
          amount: number | null;
          status: string;
          details: Json | null;
          record_date: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          project_id: number;
          activity_type: 'lead' | 'reservation' | 'payment' | 'pipeline';
          client_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          amount?: number | null;
          status?: string;
          details?: Json | null;
          record_date?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number;
          activity_type?: 'lead' | 'reservation' | 'payment' | 'pipeline';
          client_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          amount?: number | null;
          status?: string;
          details?: Json | null;
          record_date?: string;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: number;
          project_id: number | null;
          alert_type: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          project_id?: number | null;
          alert_type: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          project_id?: number | null;
          alert_type?: string;
          severity?: 'low' | 'medium' | 'high' | 'critical';
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: number;
          project_id: number | null;
          report_type: string;
          title: string;
          file_url: string | null;
          scheduled_for: string | null;
          generated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: number;
          project_id?: number | null;
          report_type: string;
          title: string;
          file_url?: string | null;
          scheduled_for?: string | null;
          generated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: number;
          project_id?: number | null;
          report_type?: string;
          title?: string;
          file_url?: string | null;
          scheduled_for?: string | null;
          generated_at?: string;
          created_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
