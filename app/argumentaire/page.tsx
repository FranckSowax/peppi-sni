'use client';

import Image from 'next/image';
import { 
  Target, 
  ShoppingCart, 
  HardHat, 
  TrendingUp,
  Map,
  BarChart3,
  MessageSquare,
  Shield,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Download,
  ArrowRight,
  Zap,
  Eye,
  FileText,
  Bell,
  Camera,
  Globe,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArgumentairePage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Bouton d'impression (caché à l'impression) */}
      <div className="fixed top-4 right-4 z-50 print:hidden flex gap-2">
        <Button onClick={handlePrint} className="shadow-lg">
          <Printer className="w-4 h-4 mr-2" />
          Imprimer / PDF
        </Button>
      </div>

      {/* Document A4 */}
      <div className="bg-gray-100 min-h-screen print:bg-white print:min-h-0">
        <div className="max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none">
          
          {/* PAGE 1 - Couverture */}
          <section className="min-h-[297mm] relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 print:p-8 page-break-after">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                    <Image
                      src="/logo-sni.png"
                      alt="Logo SNI"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">PEPPI-SNI</h2>
                    <p className="text-gray-400 text-sm">Société Nationale Immobilière</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Document confidentiel</p>
                  <p className="text-sm text-gray-400">Décembre 2024</p>
                </div>
              </div>

              {/* Titre principal */}
              <div className="text-center mt-24 mb-20">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
                  <Shield className="w-4 h-4" />
                  Proposition de valeur
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                  Transformez la gestion<br />
                  de vos projets immobiliers avec{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                    PEPPI
                  </span>
                </h1>

                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Une plateforme centralisée et intelligente pour piloter l&apos;ensemble 
                  de vos opérations immobilières, du terrain à la direction générale.
                </p>
              </div>

              {/* Stats clés */}
              <div className="grid grid-cols-4 gap-6 mt-16">
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur">
                  <p className="text-4xl font-bold text-amber-400">-40%</p>
                  <p className="text-sm text-gray-400 mt-2">Temps de reporting</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur">
                  <p className="text-4xl font-bold text-amber-400">100%</p>
                  <p className="text-sm text-gray-400 mt-2">Visibilité terrain</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur">
                  <p className="text-4xl font-bold text-amber-400">-25%</p>
                  <p className="text-sm text-gray-400 mt-2">Coûts d&apos;achat</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur">
                  <p className="text-4xl font-bold text-amber-400">24/7</p>
                  <p className="text-sm text-gray-400 mt-2">Accès aux données</p>
                </div>
              </div>

              {/* Footer page 1 */}
              <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-sm text-gray-500">
                <p>PEPPI-SNI - Argumentaire Commercial</p>
                <p>Page 1/4</p>
              </div>
            </div>
          </section>

          {/* PAGE 2 - Les défis actuels */}
          <section className="min-h-[297mm] p-12 print:p-8 page-break-after bg-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Les défis actuels de la SNI</h2>
              <p className="text-gray-500">Pourquoi une transformation digitale est essentielle</p>
            </div>

            {/* Problèmes */}
            <div className="space-y-6 mb-12">
              <div className="flex gap-6 p-6 bg-red-50 rounded-xl border border-red-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Manque de visibilité terrain</h3>
                  <p className="text-gray-600 mb-3">
                    Les informations des chantiers arrivent par téléphone, WhatsApp personnel, ou lors de réunions hebdomadaires. 
                    La direction découvre souvent les problèmes trop tard.
                  </p>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-400">
                    <p className="text-sm italic text-gray-700">
                      <strong>Mise en situation :</strong> Un retard de livraison de ciment bloque un chantier pendant 3 jours. 
                      La direction n&apos;est informée qu&apos;à la réunion du vendredi, alors que le problème aurait pu être 
                      résolu en 24h avec une alerte immédiate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 p-6 bg-orange-50 rounded-xl border border-orange-100">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Reporting chronophage et fragmenté</h3>
                  <p className="text-gray-600 mb-3">
                    Les équipes passent des heures à compiler des données Excel, consolider des rapports, 
                    et préparer des présentations pour la direction.
                  </p>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm italic text-gray-700">
                      <strong>Mise en situation :</strong> Chaque lundi, le responsable chantier passe 4 heures à 
                      consolider les avancements de 12 projets dans un fichier Excel. Ces données sont déjà obsolètes 
                      quand elles arrivent à la DG.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 p-6 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Achats non optimisés</h3>
                  <p className="text-gray-600 mb-3">
                    Sans comparaison systématique des prix entre fournisseurs et pays, 
                    la SNI passe à côté d&apos;économies substantielles sur les matériaux.
                  </p>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-amber-400">
                    <p className="text-sm italic text-gray-700">
                      <strong>Mise en situation :</strong> Le même carrelage est acheté 15 000 FCFA/m² au Gabon 
                      alors qu&apos;il est disponible à 8 000 FCFA/m² en Chine (livré). Sur 10 000 m², 
                      c&apos;est 70 millions FCFA d&apos;économie potentielle.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Coordination difficile entre équipes</h3>
                  <p className="text-gray-600 mb-3">
                    Les équipes terrain, achats, finance et direction travaillent en silos 
                    avec des outils différents et des données non synchronisées.
                  </p>
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm italic text-gray-700">
                      <strong>Mise en situation :</strong> Le service achats commande du matériel pour un projet 
                      qui a été suspendu la veille par la finance. Personne n&apos;a communiqué l&apos;information.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-sm text-gray-500">
              <p>PEPPI-SNI - Argumentaire Commercial</p>
              <p>Page 2/4</p>
            </div>
          </section>

          {/* PAGE 3 - Les solutions PEPPI */}
          <section className="min-h-[297mm] p-12 print:p-8 page-break-after bg-gray-50">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Les solutions PEPPI</h2>
              <p className="text-gray-500">Une réponse concrète à chaque défi</p>
            </div>

            {/* Module 1 - Chantier 360° */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <HardHat className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Chantier 360° + WhatsApp</h3>
                  <p className="text-gray-500">Visibilité terrain en temps réel</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Feed WhatsApp centralisé</p>
                    <p className="text-sm text-gray-500">Les techniciens envoient photos et rapports via WhatsApp, tout arrive dans PEPPI</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Alertes points bloquants</p>
                    <p className="text-sm text-gray-500">Notification immédiate à la direction en cas de problème critique</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Suivi avancement par tâche</p>
                    <p className="text-sm text-gray-500">Progression visuelle de chaque série de travaux (0-100%)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Mode technicien mobile</p>
                    <p className="text-sm text-gray-500">Interface tactile optimisée pour mise à jour sur le terrain</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800">
                  <strong>💡 Valeur ajoutée :</strong> La direction voit l&apos;avancement de tous les chantiers 
                  en un coup d&apos;œil, avec photos du jour. Les problèmes sont détectés et traités en heures, pas en jours.
                </p>
              </div>
            </div>

            {/* Module 2 - Achats/Supply */}
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Achats / Supply Chain</h3>
                  <p className="text-gray-500">Optimisation des coûts matériaux</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Import automatique de devis</p>
                    <p className="text-sm text-gray-500">Excel, PDF, CSV - extraction IA des matériaux et prix</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Comparaison multi-pays</p>
                    <p className="text-sm text-gray-500">Gabon, Cameroun, Chine, Dubaï, Turquie - conversion automatique</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Base de prix référence</p>
                    <p className="text-sm text-gray-500">Historique des prix pour négociation fournisseurs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Alertes économies</p>
                    <p className="text-sm text-gray-500">Détection automatique des opportunités d&apos;achat</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800">
                  <strong>💡 Valeur ajoutée :</strong> Économies de 15-25% sur les achats matériaux grâce à la 
                  comparaison systématique. Sur un budget annuel de 2 milliards FCFA, c&apos;est 300-500 millions d&apos;économies.
                </p>
              </div>
            </div>

            {/* Module 3 - Rapports IA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Rapports IA automatisés</h3>
                  <p className="text-gray-500">Génération intelligente de synthèses</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Synthèse hebdomadaire auto</p>
                    <p className="text-sm text-gray-500">L&apos;IA compile et analyse toutes les données terrain</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Export PDF professionnel</p>
                    <p className="text-sm text-gray-500">Rapports prêts pour le conseil d&apos;administration</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <p className="text-sm text-green-800">
                  <strong>💡 Valeur ajoutée :</strong> Le rapport hebdomadaire qui prenait 4 heures est généré 
                  en 30 secondes. Les équipes se concentrent sur l&apos;action, pas sur le reporting.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-sm text-gray-500">
              <p>PEPPI-SNI - Argumentaire Commercial</p>
              <p>Page 3/4</p>
            </div>
          </section>

          {/* PAGE 4 - ROI et prochaines étapes */}
          <section className="min-h-[297mm] p-12 print:p-8 bg-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Retour sur investissement</h2>
              <p className="text-gray-500">Des bénéfices mesurables dès les premiers mois</p>
            </div>

            {/* ROI Cards */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-700">300-500M</p>
                    <p className="text-sm text-green-600">FCFA / an</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Économies sur les achats</p>
                <p className="text-sm text-gray-500 mt-1">Grâce à la comparaison multi-fournisseurs et multi-pays</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-700">-40%</p>
                    <p className="text-sm text-blue-600">temps reporting</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Gain de productivité</p>
                <p className="text-sm text-gray-500 mt-1">Rapports automatisés, données centralisées</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-700">-70%</p>
                    <p className="text-sm text-amber-600">délai réaction</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Réactivité accrue</p>
                <p className="text-sm text-gray-500 mt-1">Alertes temps réel, décisions rapides</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-700">100%</p>
                    <p className="text-sm text-purple-600">visibilité</p>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">Transparence totale</p>
                <p className="text-sm text-gray-500 mt-1">Tous les projets, toutes les données, en temps réel</p>
              </div>
            </div>

            {/* Fonctionnalités techniques */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-10">
              <h3 className="font-bold text-gray-900 mb-4">Caractéristiques techniques</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Accessible partout (web)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Optimisé mobile</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Données sécurisées</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Intégration WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Tableaux de bord temps réel</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Export PDF/Excel</span>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Prêt à transformer la SNI ?</h3>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                PEPPI est déjà opérationnel et prêt à être déployé. 
                Commencez par un projet pilote pour mesurer les bénéfices concrets.
              </p>
              <div className="flex justify-center gap-4">
                <div className="bg-white/10 rounded-lg px-6 py-3">
                  <p className="text-sm text-gray-400">Déploiement</p>
                  <p className="font-bold">Immédiat</p>
                </div>
                <div className="bg-white/10 rounded-lg px-6 py-3">
                  <p className="text-sm text-gray-400">Formation</p>
                  <p className="font-bold">1 journée</p>
                </div>
                <div className="bg-white/10 rounded-lg px-6 py-3">
                  <p className="text-sm text-gray-400">Support</p>
                  <p className="font-bold">Inclus</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="mt-10 text-center">
              <p className="text-gray-500 text-sm">
                Pour toute question ou démonstration, contactez l&apos;équipe PEPPI
              </p>
              <p className="text-gray-900 font-medium mt-2">
                peppi@sni.ga | +241 XX XX XX XX
              </p>
            </div>

            {/* Footer */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-sm text-gray-500">
              <p>PEPPI-SNI - Argumentaire Commercial</p>
              <p>Page 4/4</p>
            </div>
          </section>

        </div>
      </div>

    </>
  );
}
