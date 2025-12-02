import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/widgets/StatsCard';
import { ProjectMapWidget } from '@/components/dashboard/widgets/ProjectMapWidget';
import { FinancialChart } from '@/components/dashboard/widgets/FinancialChart';
import { FieldFeedWidget } from '@/components/dashboard/widgets/FieldFeedWidget';
import { AlertsWidget } from '@/components/dashboard/widgets/AlertsWidget';
import { ProjectProgressWidget } from '@/components/dashboard/widgets/ProjectProgressWidget';
import { Building, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Dashboard Global" 
        subtitle="Vue d'ensemble de tous les projets SNI" 
      />
      
      <main className="p-3 sm:p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
          <StatsCard
            title="Projets Actifs"
            value="24"
            change="+3 ce mois"
            changeType="positive"
            icon={Building}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatsCard
            title="Progression Moyenne"
            value="67%"
            change="+5% vs mois dernier"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatsCard
            title="Budget Engagé"
            value="12.5 Mds"
            change="XAF"
            changeType="neutral"
            icon={DollarSign}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatsCard
            title="Alertes Actives"
            value="7"
            change="2 critiques"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
        </div>

        {/* Main Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
          <ProjectMapWidget />
          <FinancialChart />
          <ProjectProgressWidget />
        </div>

        {/* Secondary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <FieldFeedWidget />
          <AlertsWidget />
        </div>
      </main>
    </div>
  );
}
