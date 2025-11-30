import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const kpis = [
  { name: 'Taux de livraison', target: 85, current: 78, unit: '%' },
  { name: 'Satisfaction client', target: 90, current: 87, unit: '%' },
  { name: 'Délai moyen', target: 18, current: 21, unit: 'mois' },
  { name: 'Budget respecté', target: 95, current: 89, unit: '%' },
];

const actionPlans = [
  { id: 1, title: 'Optimisation processus achats', status: 'in_progress', priority: 'high', progress: 65 },
  { id: 2, title: 'Formation équipes terrain', status: 'completed', priority: 'medium', progress: 100 },
  { id: 3, title: 'Digitalisation suivi chantier', status: 'in_progress', priority: 'urgent', progress: 40 },
  { id: 4, title: 'Révision contrats fournisseurs', status: 'pending', priority: 'medium', progress: 0 },
];

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700', icon: Clock },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

const priorityConfig = {
  low: { label: 'Basse', color: 'text-gray-500' },
  medium: { label: 'Moyenne', color: 'text-blue-500' },
  high: { label: 'Haute', color: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'text-red-500' },
};

export default function StrategiePage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Stratégie" 
        subtitle="KPIs et plans d'action stratégiques" 
      />
      
      <main className="p-6">
        {/* KPIs Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Indicateurs Clés de Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => {
              const percentage = (kpi.current / kpi.target) * 100;
              const isOnTrack = percentage >= 90;
              return (
                <Card key={kpi.name}>
                  <CardHeader className="pb-2">
                    <CardDescription>{kpi.name}</CardDescription>
                    <CardTitle className="text-2xl">
                      {kpi.current}{kpi.unit}
                      <span className="text-sm font-normal text-gray-400 ml-2">
                        / {kpi.target}{kpi.unit}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className={`text-xs mt-2 ${isOnTrack ? 'text-green-600' : 'text-amber-600'}`}>
                      {isOnTrack ? 'Sur la bonne voie' : 'Attention requise'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Plans Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Plans d&apos;Action
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">Action</th>
                      <th className="text-left p-4 font-medium text-gray-600">Statut</th>
                      <th className="text-left p-4 font-medium text-gray-600">Priorité</th>
                      <th className="text-left p-4 font-medium text-gray-600">Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionPlans.map((plan) => {
                      const status = statusConfig[plan.status as keyof typeof statusConfig];
                      const priority = priorityConfig[plan.priority as keyof typeof priorityConfig];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={plan.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-4 font-medium">{plan.title}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-sm font-medium ${priority.color}`}>
                              {priority.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${plan.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{plan.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
