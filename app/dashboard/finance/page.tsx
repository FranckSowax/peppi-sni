'use client';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, FileText, Download } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const budgetData = [
  { project: 'Okoumé', budget: 5000, spent: 3750 },
  { project: 'Marina', budget: 8000, spent: 4200 },
  { project: 'Akanda', budget: 3000, spent: 2700 },
  { project: 'Ntoum', budget: 4500, spent: 1350 },
];

const expenseCategories = [
  { name: 'Matériaux', value: 45, color: '#f5821f' },
  { name: 'Main d\'œuvre', value: 30, color: '#00529b' },
  { name: 'Équipements', value: 15, color: '#10b981' },
  { name: 'Autres', value: 10, color: '#6b7280' },
];

const invoices = [
  { id: 'FAC-001', supplier: 'Ciments du Gabon', amount: 12500000, status: 'paid', date: '2024-01-15' },
  { id: 'FAC-002', supplier: 'Acier Plus', amount: 8750000, status: 'pending', date: '2024-01-18' },
  { id: 'FAC-003', supplier: 'BTP Materials', amount: 5200000, status: 'approved', date: '2024-01-20' },
  { id: 'FAC-004', supplier: 'Électro Gabon', amount: 3100000, status: 'pending', date: '2024-01-22' },
];

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approuvé', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
}

export default function FinancePage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Finance" 
        subtitle="Suivi budgétaire et facturation" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Budget Total</CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20.5 Mds</div>
              <p className="text-xs text-gray-500">XAF</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Dépensé</CardTitle>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.0 Mds</div>
              <p className="text-xs text-gray-500">58% du budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Disponible</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">8.5 Mds</div>
              <p className="text-xs text-gray-500">42% restant</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Factures en attente</CardTitle>
              <FileText className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500">29.5 M XAF</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Budget vs Spent Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Dépenses par Projet</CardTitle>
              <CardDescription>En millions XAF</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="project" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="budget" name="Budget" fill="#f5821f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Dépensé" fill="#00529b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Dépenses</CardTitle>
              <CardDescription>Par catégorie</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Factures Récentes</CardTitle>
                <CardDescription>Suivi des paiements fournisseurs</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Exporter Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-600">N° Facture</th>
                    <th className="text-left p-3 font-medium text-gray-600">Fournisseur</th>
                    <th className="text-left p-3 font-medium text-gray-600">Montant</th>
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig];
                    return (
                      <tr key={invoice.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium">{invoice.id}</td>
                        <td className="p-3">{invoice.supplier}</td>
                        <td className="p-3">{formatCurrency(invoice.amount)}</td>
                        <td className="p-3 text-gray-500">{invoice.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
