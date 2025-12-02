'use client';

import { Bell, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="min-h-14 md:h-16 border-b bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-0 gap-2 sm:gap-0">
      <div className="pl-10 lg:pl-0">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-9 w-48 xl:w-64"
          />
        </div>

        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Search className="w-5 h-5" />
        </Button>

        {/* AI Assistant Button */}
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="hidden md:inline">Assistant IA</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
