'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  Calendar,
  Loader2,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Package,
  Building2,
  Sparkles,
  Copy,
  Check,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportStats {
  total: number;
  problemes: number;
  avancements: number;
  livraisons: number;
  projets: string[];
}

interface GeneratedReport {
  report: string;
  stats: ReportStats;
  provider: string;
  period: {
    start: string;
    end: string;
  };
}

export default function RapportsPage() {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 7); // 7 jours par défaut
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [copied, setCopied] = useState(false);

  // Raccourcis de période
  const setPeriod = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Veuillez sélectionner une période');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('La date de début doit être antérieure à la date de fin');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setReport(data);
      toast.success(`Rapport généré avec ${data.provider === 'gemini' ? 'Gemini' : 'OpenAI'}`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report.report);
      setCopied(true);
      toast.success('Rapport copié dans le presse-papier');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const printReport = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapport SNI - ${new Date(report.period.start).toLocaleDateString('fr-FR')} au ${new Date(report.period.end).toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; }
            h2 { color: #2d3748; margin-top: 30px; }
            h3 { color: #4a5568; }
            ul { margin-left: 20px; }
            .stats { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a365d; }
            .period { color: #718096; font-size: 14px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🏗️ SNI - Société Nationale Immobilière</div>
            <div class="period">Rapport du ${new Date(report.period.start).toLocaleDateString('fr-FR')} au ${new Date(report.period.end).toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="stats">
            <strong>Statistiques:</strong> ${report.stats.total} messages | ${report.stats.problemes} problèmes | ${report.stats.avancements} avancées | ${report.stats.livraisons} livraisons
          </div>
          ${report.report.replace(/\n/g, '<br>').replace(/#{1,6}\s/g, '<h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader title="Rapports IA" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Période du rapport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Raccourcis */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setPeriod(1)}>
                  Aujourd&apos;hui
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPeriod(7)}>
                  7 derniers jours
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPeriod(14)}>
                  14 derniers jours
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPeriod(30)}>
                  30 derniers jours
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPeriod(90)}>
                  3 mois
                </Button>
              </div>

              {/* Sélection de dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={generateReport} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Générer le rapport
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rapport généré */}
        {report && (
          <>
            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{report.stats.total}</div>
                  <div className="text-sm text-gray-500">Messages</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{report.stats.problemes}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Problèmes
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{report.stats.avancements}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Avancées
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600">{report.stats.livraisons}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Package className="w-3 h-3" /> Livraisons
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{report.stats.projets.length}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Building2 className="w-3 h-3" /> Projets
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenu du rapport */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Rapport de Synthèse
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Du {formatDate(report.period.start)} au {formatDate(report.period.end)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {report.provider === 'gemini' ? 'Gemini Pro' : 'GPT-4o'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={printReport}>
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateReport} disabled={loading}>
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                    {report.report.split('\n').map((line, i) => {
                      // Titres
                      if (line.startsWith('# ')) {
                        return <h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-4 border-b pb-2">{line.replace('# ', '')}</h1>;
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={i} className="text-xl font-semibold text-gray-800 mt-5 mb-3">{line.replace('## ', '')}</h2>;
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="text-lg font-medium text-gray-700 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      }
                      // Listes
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return <li key={i} className="ml-4 mb-1">{line.replace(/^[-*]\s/, '')}</li>;
                      }
                      // Texte en gras
                      if (line.includes('**')) {
                        const parts = line.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={i} className="mb-2">
                            {parts.map((part, j) => 
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      // Ligne vide
                      if (line.trim() === '') {
                        return <br key={i} />;
                      }
                      // Texte normal
                      return <p key={i} className="mb-2">{line}</p>;
                    })}
                  </div>
                </div>

                {/* Projets concernés */}
                {report.stats.projets.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Projets concernés:</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.stats.projets.map((projet, i) => (
                        <Badge key={i} variant="secondary">
                          <Building2 className="w-3 h-3 mr-1" />
                          {projet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* État initial */}
        {!report && !loading && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Générez votre premier rapport
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Sélectionnez une période et cliquez sur &quot;Générer le rapport&quot; pour créer 
                une synthèse automatique des messages WhatsApp collectés sur le terrain.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
