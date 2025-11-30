'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Building2,
  Send,
  FileCheck,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const COURRIER_TYPES = [
  { id: 'demande_autorisation', label: 'Demande d\'autorisation', icon: FileCheck },
  { id: 'relance_fournisseur', label: 'Relance fournisseur', icon: Send },
  { id: 'notification_retard', label: 'Notification de retard', icon: AlertCircle },
  { id: 'convocation_reunion', label: 'Convocation réunion', icon: FileText },
  { id: 'rapport_avancement', label: 'Rapport d\'avancement', icon: FileText },
  { id: 'demande_paiement', label: 'Demande de paiement', icon: FileText },
  { id: 'mise_en_demeure', label: 'Mise en demeure', icon: AlertCircle },
  { id: 'attestation', label: 'Attestation', icon: FileCheck },
];

const DEMO_PROJECTS = [
  { id: 1, name: 'Résidence Les Palmiers' },
  { id: 2, name: 'Centre Commercial Oloumi' },
  { id: 3, name: 'Logements Sociaux Nzeng-Ayong' },
  { id: 4, name: 'Bureaux Ministériels' },
  { id: 5, name: 'École Primaire Akébé' },
  { id: 6, name: 'Hôpital Régional Franceville' },
];

export default function CourrierPage() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!selectedType) {
      toast.error('Veuillez sélectionner un type de courrier');
      return;
    }

    setGenerating(true);
    setGeneratedContent('');

    // Simulation de génération IA (à remplacer par appel Gemini)
    setTimeout(() => {
      const type = COURRIER_TYPES.find(t => t.id === selectedType);
      const project = DEMO_PROJECTS.find(p => p.id.toString() === selectedProject);
      
      const templates: Record<string, string> = {
        demande_autorisation: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction Générale
---

Libreville, le ${new Date().toLocaleDateString('fr-FR')}

${recipient ? `À l'attention de : ${recipient}` : 'À l\'attention de : [Destinataire]'}

Objet : ${subject || 'Demande d\'autorisation de travaux'}
${project ? `Référence projet : ${project.name}` : ''}

Madame, Monsieur,

Par la présente, nous avons l'honneur de solliciter votre autorisation pour la réalisation des travaux suivants dans le cadre ${project ? `du projet "${project.name}"` : 'de notre projet immobilier'}.

${additionalContext || 'Description des travaux envisagés et justification de la demande.'}

Nous restons à votre entière disposition pour tout complément d'information et vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

Le Directeur Général
SNI Gabon
        `.trim(),

        relance_fournisseur: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Service Achats
---

Libreville, le ${new Date().toLocaleDateString('fr-FR')}

${recipient ? `À l'attention de : ${recipient}` : 'À l\'attention de : [Fournisseur]'}

Objet : ${subject || 'Relance - Livraison en attente'}
${project ? `Référence projet : ${project.name}` : ''}

Madame, Monsieur,

Nous nous permettons de vous relancer concernant notre commande passée le [date de commande], référence [numéro de commande].

${additionalContext || 'À ce jour, nous n\'avons toujours pas reçu les matériaux commandés, ce qui impacte significativement l\'avancement de nos travaux.'}

Nous vous saurions gré de bien vouloir nous informer dans les plus brefs délais de la date de livraison prévue.

Dans l'attente de votre retour, nous vous prions d'agréer, Madame, Monsieur, nos salutations distinguées.

Le Responsable Achats
SNI Gabon
        `.trim(),

        notification_retard: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction des Projets
---

Libreville, le ${new Date().toLocaleDateString('fr-FR')}

${recipient ? `À l'attention de : ${recipient}` : 'À l\'attention de : [Entreprise/Prestataire]'}

Objet : ${subject || 'Notification de retard - Mise en garde'}
${project ? `Référence projet : ${project.name}` : ''}

Madame, Monsieur,

Nous avons le regret de constater un retard significatif dans l'exécution des travaux qui vous ont été confiés ${project ? `dans le cadre du projet "${project.name}"` : ''}.

${additionalContext || 'Le planning initial prévoyait une livraison pour le [date prévue]. À ce jour, le retard accumulé est de [X] jours/semaines.'}

Nous vous mettons en demeure de prendre toutes les dispositions nécessaires pour rattraper ce retard dans les meilleurs délais.

À défaut, nous nous réservons le droit d'appliquer les pénalités prévues au contrat.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

Le Directeur des Projets
SNI Gabon
        `.trim(),

        convocation_reunion: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction Générale
---

Libreville, le ${new Date().toLocaleDateString('fr-FR')}

CONVOCATION À UNE RÉUNION

${recipient ? `Destinataires : ${recipient}` : 'Destinataires : [Liste des participants]'}

Objet : ${subject || 'Réunion de coordination'}
${project ? `Projet concerné : ${project.name}` : ''}

Madame, Monsieur,

Vous êtes convoqué(e) à une réunion qui se tiendra :

📅 Date : [À préciser]
🕐 Heure : [À préciser]
📍 Lieu : Siège SNI, Libreville

Ordre du jour :
${additionalContext || '1. Point sur l\'avancement des travaux\n2. Revue des difficultés rencontrées\n3. Planning prévisionnel\n4. Questions diverses'}

Votre présence est indispensable. En cas d'empêchement, merci de vous faire représenter.

Cordialement,

Le Secrétariat Général
SNI Gabon
        `.trim(),

        rapport_avancement: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction des Projets
---

RAPPORT D'AVANCEMENT
${project ? `Projet : ${project.name}` : 'Projet : [Nom du projet]'}
Date : ${new Date().toLocaleDateString('fr-FR')}

---

1. RÉSUMÉ EXÉCUTIF
${additionalContext || 'Synthèse de l\'état d\'avancement global du projet.'}

2. AVANCEMENT PHYSIQUE
- Progression globale : [X]%
- Travaux réalisés cette période : [Description]
- Travaux prévus prochaine période : [Description]

3. SITUATION FINANCIÈRE
- Budget total : [Montant] XAF
- Dépenses engagées : [Montant] XAF
- Reste à engager : [Montant] XAF

4. POINTS D'ATTENTION
- [Point 1]
- [Point 2]

5. PLANNING
- Date de livraison prévue : [Date]
- Écart par rapport au planning initial : [+/- X jours]

---

Établi par : [Nom du responsable]
Validé par : Direction des Projets
        `.trim(),

        demande_paiement: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction Financière
---

Libreville, le ${new Date().toLocaleDateString('fr-FR')}

${recipient ? `À l'attention de : ${recipient}` : 'À l\'attention de : [Service Comptabilité]'}

Objet : ${subject || 'Demande de règlement'}
${project ? `Référence projet : ${project.name}` : ''}

Madame, Monsieur,

Par la présente, nous sollicitons le règlement de la facture suivante :

- Numéro de facture : [Référence]
- Montant : [Montant] XAF
- Objet : ${additionalContext || '[Description des prestations/fournitures]'}

Les travaux/prestations ont été réalisés conformément au cahier des charges et réceptionnés le [date].

Vous trouverez ci-joint les pièces justificatives nécessaires.

Dans l'attente de votre règlement, nous vous prions d'agréer, Madame, Monsieur, nos salutations distinguées.

Le Responsable Financier
SNI Gabon
        `.trim(),

        mise_en_demeure: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction Juridique
---

LETTRE RECOMMANDÉE AVEC ACCUSÉ DE RÉCEPTION

Libreville, le ${new Date().toLocaleDateString('fr-FR')}

${recipient ? `À l'attention de : ${recipient}` : 'À l\'attention de : [Destinataire]'}

Objet : ${subject || 'MISE EN DEMEURE'}
${project ? `Référence : ${project.name}` : ''}

Madame, Monsieur,

Par la présente, nous vous mettons en demeure de :

${additionalContext || '[Décrire précisément les obligations non respectées et les actions attendues]'}

Conformément aux dispositions contractuelles et légales en vigueur, vous disposez d'un délai de [X] jours à compter de la réception de ce courrier pour vous conformer à vos obligations.

À défaut, nous nous verrons contraints d'engager toutes les procédures judiciaires nécessaires à la défense de nos intérêts, sans autre avis de notre part.

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

Le Directeur Juridique
SNI Gabon
        `.trim(),

        attestation: `
SOCIÉTÉ NATIONALE IMMOBILIÈRE DU GABON
Direction Générale
---

ATTESTATION

Je soussigné, [Nom et Fonction], agissant au nom et pour le compte de la Société Nationale Immobilière du Gabon (SNI),

ATTESTE QUE :

${recipient ? `${recipient}` : '[Nom de la personne/entreprise]'}

${additionalContext || '[Objet de l\'attestation - ex: a bien réalisé les travaux de... / est bien employé par... / a bien fourni les matériaux...]'}

${project ? `Cette attestation est délivrée dans le cadre du projet "${project.name}".` : ''}

${subject ? `Motif : ${subject}` : ''}

Cette attestation est délivrée pour servir et valoir ce que de droit.

Fait à Libreville, le ${new Date().toLocaleDateString('fr-FR')}

[Signature]
Le Directeur Général
SNI Gabon

[Cachet de l'entreprise]
        `.trim(),
      };

      setGeneratedContent(templates[selectedType] || 'Type de courrier non reconnu.');
      setGenerating(false);
      toast.success('Courrier généré avec succès');
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `courrier_${selectedType}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fichier téléchargé');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Générateur de Courrier" 
        subtitle="Génération automatique de courriers via IA (Gemini)" 
      />
      
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire */}
          <div className="space-y-6">
            {/* Type de courrier */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Type de courrier
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {COURRIER_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-left transition-all flex items-center gap-2",
                          selectedType === type.id
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-primary/50"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Détails */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Détails du courrier
                </h3>
                
                <div>
                  <Label>Projet concerné (optionnel)</Label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm mt-1"
                  >
                    <option value="">Aucun projet spécifique</option>
                    {DEMO_PROJECTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Destinataire</Label>
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Nom du destinataire ou de l'entreprise"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Objet / Sujet</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Objet du courrier"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Contexte additionnel</Label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="Informations supplémentaires pour personnaliser le courrier..."
                    className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none mt-1"
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={generating || !selectedType}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Générer avec Gemini
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Résultat */}
          <Card className="h-fit">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Courrier généré
                </h3>
                {generatedContent && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {generatedContent ? (
                <div className="bg-white border rounded-lg p-6 min-h-[500px] whitespace-pre-wrap font-mono text-sm">
                  {generatedContent}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-12 min-h-[500px] flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Sélectionnez un type de courrier</p>
                  <p className="text-gray-400 text-sm">
                    Le courrier sera généré automatiquement par l&apos;IA Gemini
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
