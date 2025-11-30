'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Package, 
  Download,
  Loader2,
  TrendingDown,
  TrendingUp,
  Ship,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Material {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
}

interface Price {
  id: number;
  material_id: string;
  amount: number;
  currency: string;
  country: string;
  converted_amount: number | null;
  notes: string | null;
}

interface Project {
  id: number;
  name: string;
}

// Pays locaux (Afrique)
const LOCAL_COUNTRIES = ['Gabon', 'Cameroun', 'Congo', 'Sénégal', 'Côte d\'Ivoire'];

// Taux de transport par CBM (en USD)
const SHIPPING_RATES: Record<string, number> = {
  'Chine': 50,
  'Dubai': 80,
  'Turquie': 70,
  'Inde': 60,
};

// Taux de change vers FCFA
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 600,
  'EUR': 656,
  'CNY': 85,
  'AED': 165,
  'TRY': 18,
  'FCFA': 1,
};

export default function ComparisonPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pricesByMaterial, setPricesByMaterial] = useState<Record<string, Price[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: projectData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .single();

      setProject(projectData);

      const { data: materialsData } = await supabase
        .from('materials')
        .select('id, name, quantity, unit')
        .eq('project_id', projectId)
        .order('name');

      setMaterials(materialsData || []);

      if (materialsData && materialsData.length > 0) {
        const materialIds = materialsData.map(m => m.id);
        const { data: pricesData } = await supabase
          .from('prices')
          .select('*')
          .in('material_id', materialIds);

        const grouped: Record<string, Price[]> = {};
        (pricesData || []).forEach(price => {
          if (!grouped[price.material_id]) {
            grouped[price.material_id] = [];
          }
          grouped[price.material_id].push(price);
        });
        setPricesByMaterial(grouped);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir tous les pays uniques
  const allCountries = Array.from(
    new Set(
      Object.values(pricesByMaterial)
        .flat()
        .map(p => p.country)
        .filter(Boolean)
    )
  ).sort();

  // Calculer le meilleur prix pour un matériau
  const getBestPrice = (materialId: string, country?: string) => {
    const prices = pricesByMaterial[materialId] || [];
    const filtered = country 
      ? prices.filter(p => p.country === country)
      : prices;
    if (filtered.length === 0) return null;
    return filtered.reduce((min, p) => 
      (p.converted_amount || p.amount) < (min.converted_amount || min.amount) ? p : min
    );
  };

  // Calculer le total local
  const calculateLocalTotal = () => {
    return materials.reduce((total, material) => {
      const prices = pricesByMaterial[material.id] || [];
      const localPrices = prices.filter(p => LOCAL_COUNTRIES.includes(p.country));
      if (localPrices.length === 0) return total;
      
      const bestLocal = localPrices.reduce((min, p) => 
        (p.converted_amount || p.amount) < (min.converted_amount || min.amount) ? p : min
      );
      
      const quantity = material.quantity || 1;
      const price = bestLocal.converted_amount || bestLocal.amount;
      return total + (price * quantity);
    }, 0);
  };

  // Calculer le total import (Chine par défaut)
  const calculateImportTotal = (country: string = 'Chine') => {
    return materials.reduce((total, material) => {
      const prices = pricesByMaterial[material.id] || [];
      const importPrices = prices.filter(p => p.country === country);
      if (importPrices.length === 0) return total;
      
      const bestImport = importPrices.reduce((min, p) => 
        (p.converted_amount || p.amount) < (min.converted_amount || min.amount) ? p : min
      );
      
      const quantity = material.quantity || 1;
      const price = bestImport.converted_amount || bestImport.amount;
      return total + (price * quantity);
    }, 0);
  };

  // Estimer le coût de transport
  const estimateShippingCost = (country: string = 'Chine') => {
    // Estimation basée sur le volume (simplifié)
    const estimatedCBM = materials.length * 0.5; // 0.5 CBM par type de matériau en moyenne
    const ratePerCBM = SHIPPING_RATES[country] || 50;
    const shippingUSD = estimatedCBM * ratePerCBM;
    return shippingUSD * EXCHANGE_RATES['USD'];
  };

  const totalLocal = calculateLocalTotal();
  const totalChina = calculateImportTotal('Chine');
  const shippingCost = estimateShippingCost('Chine');
  const totalChinaWithShipping = totalChina + shippingCost;
  const savings = totalLocal - totalChinaWithShipping;
  const savingsPercentage = totalLocal > 0 ? ((savings / totalLocal) * 100).toFixed(1) : '0';

  const handleExportPDF = () => {
    toast.info('Export PDF en cours de développement');
    // TODO: Implémenter l'export PDF avec jspdf
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Comparaison" subtitle="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader 
        title="Comparaison des Prix" 
        subtitle={project?.name || 'Projet'} 
      />
      
      <main className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/dashboard/achats/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux matériaux
            </Button>
          </Link>
          
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>

        {/* Cards Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card Local */}
          <Card className="border-0 bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600">📍 Coût Total Local</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(totalLocal).toLocaleString()} <span className="text-lg">FCFA</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Gabon, Cameroun, Congo...
              </p>
            </CardContent>
          </Card>

          {/* Card Chine */}
          <Card className="border-0 bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-500 to-green-600" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Ship className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-gray-600">🇨🇳 Coût Import Chine</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(totalChina).toLocaleString()} <span className="text-lg">FCFA</span>
              </p>
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">+ Transport estimé:</span>
                  <span className="font-medium text-orange-500">
                    {Math.round(shippingCost).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600 font-medium">Total:</span>
                  <span className="text-xl font-bold">
                    {Math.round(totalChinaWithShipping).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Économie */}
          <Card className="border-0 bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className={cn(
              "h-2 bg-gradient-to-r",
              savings > 0 ? "from-purple-500 to-purple-600" : "from-red-500 to-red-600"
            )} />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  savings > 0 ? "bg-purple-100" : "bg-red-100"
                )}>
                  {savings > 0 ? (
                    <TrendingDown className="h-6 w-6 text-purple-600" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-600">
                  {savings > 0 ? '💰 Économie potentielle' : '⚠️ Surcoût'}
                </p>
              </div>
              <p className={cn(
                "text-3xl font-bold",
                savings > 0 ? "text-purple-600" : "text-red-600"
              )}>
                {Math.round(Math.abs(savings)).toLocaleString()} <span className="text-lg">FCFA</span>
              </p>
              <p className={cn(
                "text-lg mt-2",
                savings > 0 ? "text-purple-600" : "text-red-600"
              )}>
                {savingsPercentage}% {savings > 0 ? "d'économie" : "de plus"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres par pays */}
        <Card className="p-4 bg-white shadow-lg rounded-2xl mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCountry === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCountry('all')}
              className="rounded-xl"
            >
              Tous les pays
            </Button>
            {allCountries.map(country => (
              <Button
                key={country}
                variant={selectedCountry === country ? 'default' : 'outline'}
                onClick={() => setSelectedCountry(country)}
                className="rounded-xl"
              >
                {country}
              </Button>
            ))}
          </div>
        </Card>

        {/* Liste des matériaux avec prix */}
        <div className="space-y-4">
          {materials.map(material => {
            const prices = pricesByMaterial[material.id] || [];
            const filteredPrices = selectedCountry === 'all' 
              ? prices 
              : prices.filter(p => p.country === selectedCountry);
            
            const sortedPrices = [...filteredPrices].sort((a, b) => 
              (a.converted_amount || a.amount) - (b.converted_amount || b.amount)
            );

            const bestPrice = sortedPrices[0];
            const quantity = material.quantity || 1;
            const isExpanded = expandedMaterial === material.id;

            return (
              <Card 
                key={material.id} 
                className="border-0 bg-white shadow-lg rounded-2xl overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedMaterial(isExpanded ? null : material.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{material.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline">Qté: {quantity} {material.unit || ''}</Badge>
                        {sortedPrices.length > 0 && (
                          <Badge variant="outline">{sortedPrices.length} prix</Badge>
                        )}
                        {bestPrice && (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            Meilleur: {Math.round(bestPrice.converted_amount || bestPrice.amount).toLocaleString()} FCFA
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <ChevronDown className={cn(
                        "h-5 w-5 text-gray-500 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-gray-50 border-t">
                    {sortedPrices.length > 0 ? (
                      <div className="space-y-3">
                        {sortedPrices.map((price, idx) => (
                          <div 
                            key={price.id}
                            className={cn(
                              "p-4 rounded-xl border-2",
                              idx === 0 ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-lg">
                                  {price.amount.toLocaleString()} {price.currency}
                                </p>
                                {price.currency !== 'FCFA' && price.converted_amount && (
                                  <p className="text-sm text-gray-500">
                                    ≈ {Math.round(price.converted_amount).toLocaleString()} FCFA
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 mt-1">{price.country}</p>
                                {price.notes && (
                                  <p className="text-sm text-gray-500 mt-1 italic">{price.notes}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="font-bold text-lg">
                                  {Math.round((price.converted_amount || price.amount) * quantity).toLocaleString()} FCFA
                                </p>
                                {idx === 0 && (
                                  <Badge className="mt-2 bg-green-500 text-white">Meilleur prix</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Aucun prix disponible {selectedCountry !== 'all' && `pour ${selectedCountry}`}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {materials.length === 0 && (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Aucun matériau</h3>
              <p className="text-gray-500">Ajoutez des matériaux pour comparer les prix</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
