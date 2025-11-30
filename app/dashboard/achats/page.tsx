import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Truck, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const orders = [
  { id: 'CMD-001', supplier: 'Ciments du Gabon', item: 'Ciment CPA 45', quantity: 500, unit: 'sacs', status: 'delivered', date: '2024-01-15' },
  { id: 'CMD-002', supplier: 'Acier Plus', item: 'Fer à béton 12mm', quantity: 200, unit: 'barres', status: 'shipped', date: '2024-01-18' },
  { id: 'CMD-003', supplier: 'BTP Materials', item: 'Sable fin', quantity: 50, unit: 'm³', status: 'ordered', date: '2024-01-20' },
  { id: 'CMD-004', supplier: 'Électro Gabon', item: 'Câble électrique', quantity: 1000, unit: 'm', status: 'pending', date: '2024-01-22' },
];

const inventory = [
  { item: 'Ciment CPA 45', quantity: 320, minQuantity: 100, unit: 'sacs' },
  { item: 'Fer à béton 12mm', quantity: 85, minQuantity: 50, unit: 'barres' },
  { item: 'Sable fin', quantity: 15, minQuantity: 20, unit: 'm³' },
  { item: 'Gravier 20/40', quantity: 45, minQuantity: 30, unit: 'm³' },
];

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
  ordered: { label: 'Commandé', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Expédié', color: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-700' },
};

export default function AchatsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader 
        title="Achats / Supply" 
        subtitle="Gestion des commandes et stocks" 
      />
      
      <main className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Commandes en cours</CardTitle>
              <ShoppingCart className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">En livraison</CardTitle>
              <Truck className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Alertes stock</CardTitle>
              <Package className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">2</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commandes Récentes</CardTitle>
                  <CardDescription>Suivi des commandes fournisseurs</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig];
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.item}</p>
                        <p className="text-xs text-gray-500">{order.supplier} • {order.quantity} {order.unit}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Niveaux de Stock</CardTitle>
                  <CardDescription>État des inventaires</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Rechercher..." className="pl-8 w-40" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventory.map((item) => {
                  const percentage = (item.quantity / item.minQuantity) * 100;
                  const isLow = item.quantity < item.minQuantity;
                  return (
                    <div key={item.item} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.item}</span>
                        <span className={`text-sm ${isLow ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {isLow && (
                        <p className="text-xs text-red-500">Stock bas - Minimum: {item.minQuantity} {item.unit}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
