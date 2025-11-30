-- =============================================
-- PEPPI-SNI Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wrcybztcrcoubbzjcwej/sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Roles Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('admin', 'Administrateur système avec accès complet'),
  ('direction_generale', 'Direction Générale - Vue globale et décisions stratégiques'),
  ('chef_projet', 'Chef de projet - Gestion des projets assignés'),
  ('equipe_terrain', 'Équipe terrain - Mises à jour chantier et WhatsApp'),
  ('finance', 'Finance - Gestion budgétaire et facturation'),
  ('commercial', 'Commercial - Pipeline ventes et réservations')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 2. Profiles Table (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role_id INT REFERENCES public.roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. Projects Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  phase TEXT CHECK (phase IN ('planification', 'conception', 'construction', 'livraison', 'termine')),
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'en_pause', 'termine', 'annule')),
  manager_id UUID REFERENCES public.profiles(id),
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  start_date DATE,
  end_date DATE,
  budget NUMERIC(15, 2),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. Stratégie Module Tables
-- =============================================
CREATE TABLE IF NOT EXISTS public.strategie_kpis (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.action_plans (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. Achats/Supply Module Tables
-- =============================================
CREATE TABLE IF NOT EXISTS public.supply_orders (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier TEXT NOT NULL,
  item TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12, 2),
  total_price NUMERIC(15, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'shipped', 'delivered', 'cancelled')),
  order_date DATE,
  delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity_on_hand INT DEFAULT 0,
  min_quantity INT DEFAULT 0,
  unit TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. Chantier/WhatsApp Module Tables
-- =============================================
CREATE TABLE IF NOT EXISTS public.chantier_messages (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_phone TEXT,
  message_text TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document', 'alert')),
  media_url TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. Finance Module Tables
-- =============================================
CREATE TABLE IF NOT EXISTS public.finances (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('budget', 'expense', 'invoice')),
  category TEXT,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT DEFAULT 'XAF',
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. Commercial Module Tables
-- =============================================
CREATE TABLE IF NOT EXISTS public.commercial_activities (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('lead', 'reservation', 'payment', 'pipeline')),
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  amount NUMERIC(15, 2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'negotiation', 'won', 'lost')),
  details JSONB,
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. Alerts Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.alerts (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. Reports Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES public.projects(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  scheduled_for TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- =============================================
-- 11. Create Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON public.projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_region ON public.projects(region);
CREATE INDEX IF NOT EXISTS idx_finances_project ON public.finances(project_id);
CREATE INDEX IF NOT EXISTS idx_finances_type ON public.finances(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_chantier_messages_project ON public.chantier_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_commercial_activities_project ON public.commercial_activities(project_id);

-- =============================================
-- 12. Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategie_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chantier_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin and Direction Générale can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name IN ('admin', 'direction_generale')
    )
  );

-- Projects policies - everyone can view projects
CREATE POLICY "Authenticated users can view projects" ON public.projects
  FOR SELECT TO authenticated USING (true);

-- Only admins and direction can create/update projects
CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name IN ('admin', 'direction_generale', 'chef_projet')
    )
  );

-- Module tables - authenticated users can view
CREATE POLICY "Authenticated users can view KPIs" ON public.strategie_kpis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view action plans" ON public.action_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view supply orders" ON public.supply_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view messages" ON public.chantier_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view finances" ON public.finances
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view commercial" ON public.commercial_activities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view alerts" ON public.alerts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view reports" ON public.reports
  FOR SELECT TO authenticated USING (true);

-- =============================================
-- 13. Functions and Triggers
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_action_plans_updated_at ON public.action_plans;
CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
