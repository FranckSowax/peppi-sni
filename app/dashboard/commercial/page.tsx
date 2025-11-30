'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Home, DollarSign, Plus, Phone, Mail } from 'lucide-react';

const pipelineStages = [
  { name: 'Nouveaux leads', count: 24, value: '480M XAF', color: 'bg-gray-100' },
  { name: 'Contactés', count: 18, value: '360M XAF', color: 'bg-blue-100' },
  { name: 'Négociation', count: 12, value: '240M XAF', color: 'bg-amber-100' },
  { name: 'Gagnés', count: 8, value: '160M XAF', color: 'bg-green-100' },
];

const leads = [
  { id: 1, name: 'Jean-Pierre Moussavou', project: 'Résidence Okoumé', type: 'T3', budget: '45M XAF', status: 'negotiation', phone: '+241 XX XX XX' },
  { id: 2, name: 'Marie-Claire Ndong', project: 'Marina Bay', type: 'T4', budget: '65M XAF', status: 'contacted', phone: '+241 XX XX XX' },
  { id: 3, name: 'Paul Ondo Mba', project: 'Résidence Okoumé', type: 'T2', budget: '35M XAF', status: 'new', phone: '+241 XX XX XX' },
  { id: 4, name: 'Sophie Ella Nguema', project: 'Centre Commercial', type: 'Local', budget: '120M XAF', status: 'won', phone: '+241 XX XX XX' },
];

const reservations = [
  { id: 'RES-001', client: 'Jean-Pierre Moussavou', unit: 'Apt A-301', project: 'Résidence Okoumé', amount: '45,000,000 XAF', paid: '13,500,000 XAF', progress: 30 },
  { id: 'RES-002', client: 'Marie-Claire Ndong', unit: 'Apt B-502', project: 'Marina Bay', amount: '65,000,000 XAF', paid: '32,500,000 XAF', progress: 50 },
  { id: 'RES-003', client: 'Sophie Ella Nguema', unit: 'Local C-12', project: 'Centre Commercial', amount: '120,000,000 XAF', paid: '60,000,000 XAF', progress: 50 },
];

const statusConfig = {
  new: { label: 'Nouveau', color: 'bg-gray-100 text-gray-700' },
  contacted: { label: 'Contacté', color: 'bg-blue-100 text-blue-700' },
  negotiation: { label: 'Négociation', color: 'bg-amber-100 text-amber-700' },
  won: { label: 'Gagné', color: 'bg-green-100 text-green-700' },
  lost: { label: 'Perdu', color: 'bg-red-100 text-red-700' },
};

export default function CommercialPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Commercial" 
        subtitle="Pipeline ventes et réservations" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Leads Actifs</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">54</div>
              <p className="text-xs text-green-600">+12 ce mois</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Réservations</CardTitle>
              <Home className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-gray-500">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">CA Potentiel</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.24 Mds</div>
              <p className="text-xs text-gray-500">XAF</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Encaissé</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456 M</div>
              <p className="text-xs text-gray-500">XAF ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pipeline Commercial</CardTitle>
            <CardDescription>Vue d&apos;ensemble du funnel de vente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {pipelineStages.map((stage, index) => (
                <div key={stage.name} className={`p-4 rounded-lg ${stage.color}`}>
                  <p className="text-sm font-medium text-gray-700">{stage.name}</p>
                  <p className="text-2xl font-bold mt-1">{stage.count}</p>
                  <p className="text-sm text-gray-500">{stage.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leads Récents</CardTitle>
                  <CardDescription>Prospects à suivre</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Nouveau
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {leads.map((lead) => {
                const status = statusConfig[lead.status as keyof typeof statusConfig];
                return (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{lead.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{lead.project} • {lead.type} • {lead.budget}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Reservations */}
          <Card>
            <CardHeader>
              <CardTitle>Réservations en Cours</CardTitle>
              <CardDescription>Suivi des paiements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reservations.map((res) => (
                <div key={res.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{res.client}</p>
                      <p className="text-xs text-gray-500">{res.unit} • {res.project}</p>
                    </div>
                    <span className="text-xs text-gray-400">{res.id}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Payé: {res.paid}</span>
                      <span className="font-medium">{res.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${res.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">Total: {res.amount}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
