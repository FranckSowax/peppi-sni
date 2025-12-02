'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Package, 
  Search, 
  Plus,
  Upload,
  BarChart3,
  Loader2,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Save,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Material {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  images: string[];
  created_at: string;
}

interface Price {
  id: number;
  amount: number;
  currency: string;
  country: string;
  converted_amount: number | null;
  supplier_id: string | null;
  notes: string | null;
  created_at: string;
  supplier?: {
    name: string;
    country: string;
  };
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  region: string | null;
  phase: string;
  budget: number | null;
}

const CATEGORIES = [
  'Gros œuvre',
  'Finitions',
  'Menuiserie',
  'Électricité',
  'Plomberie',
  'Couverture',
  'Équipements',
  'Autre'
];

const COUNTRIES = [
  { value: 'Gabon', label: '🇬🇦 Gabon', currency: 'FCFA' },
  { value: 'Cameroun', label: '🇨🇲 Cameroun', currency: 'FCFA' },
  { value: 'Chine', label: '🇨🇳 Chine', currency: 'CNY' },
  { value: 'Dubai', label: '🇦🇪 Dubai', currency: 'AED' },
  { value: 'Turquie', label: '🇹🇷 Turquie', currency: 'TRY' },
  { value: 'France', label: '🇫🇷 France', currency: 'EUR' },
];

export default function ProjectMaterialsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pricesByMaterial, setPricesByMaterial] = useState<Record<string, Price[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modal states
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState<string | null>(null);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Import states
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [importedItems, setImportedItems] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<any>(null);

  // New material form
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unit: ''
  });

  // New price form
  const [newPrice, setNewPrice] = useState({
    amount: '',
    currency: 'FCFA',
    country: 'Gabon',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      setProject(projectData);

      // Load materials
      const { data: materialsData } = await supabase
        .from('materials')
        .select('*')
        .eq('project_id', projectId)
        .order('category', { ascending: true });

      setMaterials(materialsData || []);

      // Load prices
      if (materialsData && materialsData.length > 0) {
        const materialIds = materialsData.map(m => m.id);
        const { data: pricesData } = await supabase
          .from('prices')
          .select('*, supplier:suppliers(name, country)')
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

  const handleAddMaterial = async () => {
    if (!newMaterial.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('materials')
        .insert({
          project_id: parseInt(projectId),
          name: newMaterial.name,
          description: newMaterial.description || null,
          category: newMaterial.category || null,
          quantity: newMaterial.quantity ? parseFloat(newMaterial.quantity) : null,
          unit: newMaterial.unit || null,
          images: []
        });

      if (error) throw error;

      toast.success('Matériau ajouté');
      setNewMaterial({ name: '', description: '', category: '', quantity: '', unit: '' });
      setShowAddMaterial(false);
      loadData();
    } catch (error) {
      console.error('Error adding material:', error);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPrice = async (materialId: string) => {
    if (!newPrice.amount) {
      toast.error('Le montant est requis');
      return;
    }

    setSaving(true);
    try {
      // Calculate converted amount
      const amount = parseFloat(newPrice.amount);
      let convertedAmount = amount;
      
      // Conversion rates to FCFA
      const rates: Record<string, number> = {
        'CNY': 85,
        'AED': 165,
        'TRY': 18,
        'EUR': 656,
        'USD': 600,
        'FCFA': 1
      };

      if (newPrice.currency !== 'FCFA') {
        convertedAmount = amount * (rates[newPrice.currency] || 1);
      }

      const { error } = await supabase
        .from('prices')
        .insert({
          material_id: materialId,
          amount: amount,
          currency: newPrice.currency,
          country: newPrice.country,
          converted_amount: convertedAmount,
          notes: newPrice.notes || null
        });

      if (error) throw error;

      toast.success('Prix ajouté');
      setNewPrice({ amount: '', currency: 'FCFA', country: 'Gabon', notes: '' });
      setShowAddPrice(null);
      loadData();
    } catch (error) {
      console.error('Error adding price:', error);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Supprimer ce matériau ?')) return;

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      toast.success('Matériau supprimé');
      loadData();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Import de fichier
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress('Lecture du fichier...');
    setImportedItems([]);
    setImportStats(null);

    try {
      const fileName = file.name.toLowerCase();
      let textContent = '';
      let fileType = 'txt';

      // Déterminer le type de fichier
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        fileType = 'excel';
        setImportProgress('Analyse du fichier Excel...');
        
        // Charger xlsx dynamiquement
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Analyser la structure
        setImportProgress('Détection des colonnes...');
        const analyzeResponse = await fetch('/api/ai/analyze-file-structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileSample: rawData.slice(0, 25),
            fileName: file.name
          }),
        });
        
        const analyzeResult = await analyzeResponse.json();
        
        if (!analyzeResult.config) {
          throw new Error('Impossible d\'analyser la structure du fichier');
        }
        
        const { headerRowIndex, columns, currency } = analyzeResult.config;
        
        // Extraction déterministe
        setImportProgress('Extraction des matériaux...');
        const items: any[] = [];
        
        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;
          
          const name = columns.name !== undefined ? row[columns.name] : row[0];
          if (!name || String(name).toLowerCase().includes('total')) continue;
          
          const item: any = { name: String(name).trim() };
          
          if (columns.description !== undefined && row[columns.description]) {
            item.description = String(row[columns.description]).trim();
          }
          if (columns.category !== undefined && row[columns.category]) {
            item.category = String(row[columns.category]).trim();
          }
          if (columns.quantity !== undefined && row[columns.quantity]) {
            const qty = parseFloat(String(row[columns.quantity]).replace(',', '.'));
            if (!isNaN(qty)) item.quantity = qty;
          }
          if (columns.unit !== undefined && row[columns.unit]) {
            item.unit = String(row[columns.unit]).trim();
          }
          if (columns.price !== undefined && row[columns.price]) {
            const priceStr = String(row[columns.price]).replace(/[^\d.,]/g, '').replace(',', '.');
            const price = parseFloat(priceStr);
            if (!isNaN(price)) {
              item.price = price;
              item.currency = currency || 'XAF';
            }
          }
          if (columns.supplier !== undefined && row[columns.supplier]) {
            item.supplier = String(row[columns.supplier]).trim();
          }
          
          items.push(item);
        }
        
        setImportedItems(items);
        setImportStats({
          total: items.length,
          withPrice: items.filter(i => i.price).length,
          withCategory: items.filter(i => i.category).length,
          method: 'excel-deterministic'
        });
        
      } else if (fileName.endsWith('.csv')) {
        fileType = 'csv';
        textContent = await file.text();
        
        setImportProgress('Extraction depuis CSV...');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', 'csv');
        
        const response = await fetch('/api/ai/extract-from-file', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur d\'extraction');
        }
        
        setImportedItems(result.items);
        setImportStats(result.stats);
        
      } else if (fileName.endsWith('.pdf')) {
        fileType = 'pdf';
        setImportProgress('Extraction du texte PDF...');
        
        // Charger pdfjs dynamiquement
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        const textParts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          setImportProgress(`Lecture page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          textParts.push(pageText);
        }
        
        textContent = textParts.join('\n\n');
        
        setImportProgress('Analyse IA du contenu...');
        const formData = new FormData();
        formData.append('textContent', textContent);
        formData.append('fileType', 'pdf');
        
        const response = await fetch('/api/ai/extract-from-file', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur d\'extraction');
        }
        
        setImportedItems(result.items);
        setImportStats(result.stats);
        
      } else if (fileName.endsWith('.txt')) {
        fileType = 'txt';
        textContent = await file.text();
        
        setImportProgress('Analyse IA du contenu...');
        const formData = new FormData();
        formData.append('textContent', textContent);
        formData.append('fileType', 'txt');
        
        const response = await fetch('/api/ai/extract-from-file', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur d\'extraction');
        }
        
        setImportedItems(result.items);
        setImportStats(result.stats);
        
      } else {
        throw new Error('Format de fichier non supporté. Utilisez: Excel, CSV, PDF ou TXT');
      }
      
      setImportProgress('');
      toast.success(`${importedItems.length || 'Extraction'} terminée !`);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(String(error));
      setImportProgress('');
    } finally {
      setImporting(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Sauvegarder les matériaux importés
  const handleSaveImportedItems = async () => {
    if (importedItems.length === 0) return;
    
    setSaving(true);
    setImportProgress('Enregistrement...');
    
    try {
      let saved = 0;
      
      for (const item of importedItems) {
        const { error } = await supabase
          .from('materials')
          .insert({
            project_id: parseInt(projectId),
            name: item.name,
            description: item.description || null,
            category: item.category || null,
            quantity: item.quantity || null,
            unit: item.unit || null,
            images: [],
            specs: {
              extracted_price: item.price,
              extracted_currency: item.currency,
              extracted_supplier: item.supplier,
              imported_at: new Date().toISOString()
            }
          });
        
        if (!error) saved++;
      }
      
      toast.success(`${saved} matériaux importés avec succès !`);
      setImportedItems([]);
      setImportStats(null);
      setShowImport(false);
      loadData();
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
      setImportProgress('');
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean))) as string[];

  const getBestPrice = (materialId: string) => {
    const prices = pricesByMaterial[materialId] || [];
    if (prices.length === 0) return null;
    return prices.reduce((min, p) => 
      (p.converted_amount || p.amount) < (min.converted_amount || min.amount) ? p : min
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader title="Matériaux" subtitle="Chargement..." />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title={project?.name || 'Projet'} 
        subtitle="Gestion des matériaux et prix" 
      />
      
      <main className="p-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/achats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux projets
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/achats/${projectId}/comparison`}>
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparaison des prix
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Matériaux</p>
                <p className="text-2xl font-bold">{materials.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prix collectés</p>
                <p className="text-2xl font-bold">{Object.values(pricesByMaterial).flat().length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Catégories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avec prix</p>
                <p className="text-2xl font-bold">
                  {materials.filter(m => (pricesByMaterial[m.id] || []).length > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher un matériau..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">Toutes catégories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          
          <Button onClick={() => setShowAddMaterial(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Import Modal */}
        {showImport && (
          <Card className="mb-6 border-2 border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  Importer des matériaux
                </h3>
                <Button variant="ghost" size="icon" onClick={() => {
                  setShowImport(false);
                  setImportedItems([]);
                  setImportStats(null);
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Zone d'upload */}
              {importedItems.length === 0 && (
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-white">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.txt"
                    onChange={handleFileImport}
                    className="hidden"
                    id="file-import"
                    disabled={importing}
                  />
                  <label htmlFor="file-import" className="cursor-pointer">
                    {importing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-blue-600 font-medium">{importProgress}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Glissez un fichier ou cliquez pour sélectionner</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Formats supportés: Excel (.xlsx, .xls), CSV, PDF, TXT
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              )}
              
              {/* Résultats d'import */}
              {importedItems.length > 0 && (
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-2xl font-bold text-blue-600">{importedItems.length}</p>
                      <p className="text-xs text-gray-500">Matériaux trouvés</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-2xl font-bold text-green-600">
                        {importedItems.filter(i => i.price).length}
                      </p>
                      <p className="text-xs text-gray-500">Avec prix</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-2xl font-bold text-purple-600">
                        {importedItems.filter(i => i.category).length}
                      </p>
                      <p className="text-xs text-gray-500">Catégorisés</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-2xl font-bold text-amber-600">
                        {importedItems.filter(i => i.supplier).length}
                      </p>
                      <p className="text-xs text-gray-500">Avec fournisseur</p>
                    </div>
                  </div>
                  
                  {/* Liste preview */}
                  <div className="bg-white rounded-lg border max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 font-medium">Nom</th>
                          <th className="text-left p-2 font-medium hidden md:table-cell">Catégorie</th>
                          <th className="text-right p-2 font-medium">Qté</th>
                          <th className="text-right p-2 font-medium">Prix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedItems.slice(0, 20).map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">
                              <span className="font-medium">{item.name}</span>
                              {item.supplier && (
                                <span className="text-xs text-gray-400 ml-2">({item.supplier})</span>
                              )}
                            </td>
                            <td className="p-2 hidden md:table-cell">
                              {item.category && (
                                <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              )}
                            </td>
                            <td className="p-2 text-right">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-2 text-right font-medium">
                              {item.price ? `${item.price.toLocaleString()} ${item.currency || 'XAF'}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importedItems.length > 20 && (
                      <p className="text-center text-sm text-gray-500 py-2 border-t">
                        ... et {importedItems.length - 20} autres matériaux
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setImportedItems([]);
                      setImportStats(null);
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                    <Button onClick={handleSaveImportedItems} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Importer {importedItems.length} matériaux
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Material Modal */}
        {showAddMaterial && (
          <Card className="mb-6 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Nouveau matériau
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddMaterial(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom *</Label>
                  <Input
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    placeholder="Ex: Ciment CEM II 42.5"
                  />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Sélectionner...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                    placeholder="Ex: 500"
                  />
                </div>
                <div>
                  <Label>Unité</Label>
                  <Input
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    placeholder="Ex: sacs, m², unités"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    placeholder="Spécifications, caractéristiques..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddMaterial(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddMaterial} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Materials List */}
        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600">Aucun matériau</h3>
                <p className="text-gray-500 mb-4">Commencez par ajouter des matériaux à ce projet</p>
                <Button onClick={() => setShowAddMaterial(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un matériau
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredMaterials.map((material) => {
              const prices = pricesByMaterial[material.id] || [];
              const bestPrice = getBestPrice(material.id);
              const isExpanded = expandedMaterial === material.id;

              return (
                <Card key={material.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Material Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedMaterial(isExpanded ? null : material.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{material.name}</h3>
                            {material.category && (
                              <Badge variant="secondary" className="text-xs">
                                {material.category}
                              </Badge>
                            )}
                          </div>
                          {material.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">{material.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            {material.quantity && (
                              <span className="text-gray-600">
                                <Package className="w-3 h-3 inline mr-1" />
                                {material.quantity} {material.unit || 'unités'}
                              </span>
                            )}
                            <span className="text-gray-600">
                              <DollarSign className="w-3 h-3 inline mr-1" />
                              {prices.length} prix
                            </span>
                            {bestPrice && (
                              <span className="text-green-600 font-medium">
                                Meilleur: {Math.round(bestPrice.converted_amount || bestPrice.amount).toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMaterial(material.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4">
                        {/* Add Price Button */}
                        {showAddPrice !== material.id ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mb-4"
                            onClick={() => setShowAddPrice(material.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter un prix
                          </Button>
                        ) : (
                          <Card className="mb-4 border-2 border-green-200">
                            <CardContent className="p-4">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                Nouveau prix
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                  <Label className="text-xs">Pays</Label>
                                  <select
                                    value={newPrice.country}
                                    onChange={(e) => {
                                      const country = COUNTRIES.find(c => c.value === e.target.value);
                                      setNewPrice({ 
                                        ...newPrice, 
                                        country: e.target.value,
                                        currency: country?.currency || 'FCFA'
                                      });
                                    }}
                                    className="w-full h-9 px-2 rounded-md border border-input bg-background text-sm"
                                  >
                                    {COUNTRIES.map(c => (
                                      <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-xs">Montant *</Label>
                                  <Input
                                    type="number"
                                    value={newPrice.amount}
                                    onChange={(e) => setNewPrice({ ...newPrice, amount: e.target.value })}
                                    placeholder="0"
                                    className="h-9"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Devise</Label>
                                  <Input
                                    value={newPrice.currency}
                                    onChange={(e) => setNewPrice({ ...newPrice, currency: e.target.value })}
                                    className="h-9"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Notes</Label>
                                  <Input
                                    value={newPrice.notes}
                                    onChange={(e) => setNewPrice({ ...newPrice, notes: e.target.value })}
                                    placeholder="Fournisseur, conditions..."
                                    className="h-9"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-3">
                                <Button variant="ghost" size="sm" onClick={() => setShowAddPrice(null)}>
                                  Annuler
                                </Button>
                                <Button size="sm" onClick={() => handleAddPrice(material.id)} disabled={saving}>
                                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ajouter'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Prices List */}
                        {prices.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Prix collectés</h4>
                            {prices
                              .sort((a, b) => (a.converted_amount || a.amount) - (b.converted_amount || b.amount))
                              .map((price, idx) => (
                                <div 
                                  key={price.id}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg",
                                    idx === 0 ? "bg-green-50 border border-green-200" : "bg-white border"
                                  )}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold">
                                        {price.amount.toLocaleString()} {price.currency}
                                      </span>
                                      {price.currency !== 'FCFA' && price.converted_amount && (
                                        <span className="text-sm text-gray-500">
                                          ≈ {Math.round(price.converted_amount).toLocaleString()} FCFA
                                        </span>
                                      )}
                                      {idx === 0 && (
                                        <Badge className="bg-green-500 text-white text-xs">Meilleur</Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {price.country}
                                      {price.notes && ` • ${price.notes}`}
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {new Date(price.created_at).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Aucun prix enregistré pour ce matériau
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
