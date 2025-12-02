'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Building2,
  LayoutDashboard,
  Target,
  ShoppingCart,
  HardHat,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  AlertTriangle,
  FileText,
  Megaphone,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

// Onglet principal séparé
const projectsNavItem: NavItem = {
  title: 'Nos Projets',
  href: '/dashboard/projets',
  icon: <Building2 className="w-5 h-5" />
};

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: 'Stratégie', href: '/dashboard/strategie', icon: <Target className="w-5 h-5" /> },
  { title: 'Achats / Supply', href: '/dashboard/achats', icon: <ShoppingCart className="w-5 h-5" /> },
  { title: 'Chantier', href: '/dashboard/chantier', icon: <HardHat className="w-5 h-5" /> },
  { title: 'Commercial', href: '/dashboard/commercial', icon: <TrendingUp className="w-5 h-5" /> },
];

// Outils & Rapports
const toolsNavItems: NavItem[] = [
  { title: 'Feed WhatsApp', href: '/dashboard/feed', icon: <MessageSquare className="w-5 h-5" /> },
  { title: 'Rapports IA', href: '/dashboard/rapports', icon: <ClipboardList className="w-5 h-5" /> },
  { title: 'Alertes', href: '/dashboard/alertes', icon: <AlertTriangle className="w-5 h-5" /> },
  { title: 'Courrier', href: '/dashboard/courrier', icon: <FileText className="w-5 h-5" /> },
  { title: 'Marketing', href: '/dashboard/marketing', icon: <Megaphone className="w-5 h-5" /> },
];

const bottomNavItems: NavItem[] = [
  { title: 'Paramètres', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image
              src="/LOGO SNI copie.png"
              alt="Logo SNI"
              fill
              className="object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg">PEPPI-SNI</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Nos Projets - Section séparée */}
      <div className="px-2 pt-4">
        <Link
          href={projectsNavItem.href}
          className={cn(
            'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors border-2',
            pathname.startsWith(projectsNavItem.href)
              ? 'bg-primary text-white border-primary'
              : 'text-gray-700 border-primary/30 hover:bg-primary/10 hover:border-primary'
          )}
        >
          {projectsNavItem.icon}
          {!collapsed && <span className="font-medium">{projectsNavItem.title}</span>}
        </Link>
      </div>

      {/* Séparateur */}
      <div className="px-4 py-3">
        {!collapsed && <p className="text-xs text-gray-400 uppercase tracking-wider">Modules</p>}
        <div className="border-t border-gray-200 mt-2" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}

        {/* Séparateur Outils & Rapports */}
        <div className="py-3">
          {!collapsed && <p className="text-xs text-gray-400 uppercase tracking-wider px-3">Outils & Rapports</p>}
          <div className="border-t border-gray-200 mt-2" />
        </div>

        {/* Tools Navigation */}
        {toolsNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t py-4 px-2 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Utilisateur</p>
              <p className="text-xs text-gray-500 truncate">Direction Générale</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
