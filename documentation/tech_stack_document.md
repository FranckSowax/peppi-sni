# Tech Stack Document

Ce document présente, en langage clair et accessible, les choix technologiques pour le projet PEPPI-SNI. Il explique pourquoi chaque technologie a été retenue et comment elle contribue à l’expérience utilisateur, à la fiabilité et à la scalabilité de la plateforme.

## 1. Frontend Technologies

Pour construire l’interface que voient et utilisent les membres de la Direction Générale et les autres profils, nous avons choisi :

- Next.js 14 (App Router)
  • Framework React optimisé pour les performances et le SEO.  
  • Offre le rendu côté serveur (SSR) et le rendu statique (SSG) pour des temps de chargement rapides.
- TypeScript
  • Ajoute la vérification de types au JavaScript pour réduire les bugs.  
  • Facilite la maintenance et l’évolution du code.
- Tailwind CSS
  • Bibliothèque de classes utilitaires pour un design entièrement sur-mesure.  
  • Permet un style cohérent (couleurs orange et bleu de la charte) et une adaptation responsive très fluide.
- shadcn/ui
  • Ensemble de composants React préconçus, accessibles (WCAG 2.1 AA) et personnalisables.  
  • Accélère le développement de l’interface tout en garantissant une expérience utilisateur homogène.
- Lucide React Icons
  • Bibliothèque d’icônes minimalistes et légères.  
  • Utilisée pour illustrer clairement chaque module et chaque action.
- Recharts et Tremor
  • Librairies de graphiques pour visualiser les indicateurs financiers et les KPIs.  
  • Choisies pour leur simplicité d’intégration et leur réactivité aux mises à jour de données.
- Mapbox ou Leaflet (intégration React)
  • Solutions de cartographie interactives pour la visualisation des projets sur la carte.  
  • Proposent des filtres et superpositions en temps réel (statuts, phases, zones d’intervention).

Ces technologies garantissent un rendu rapide, un design responsive et une interface moderne, tout en respectant la charte graphique SNI.

## 2. Backend Technologies

Le cœur de la plateforme repose sur Supabase, une suite d’outils open source qui facilite le développement :

- Supabase Auth
  • Gère l’authentification (email/mot de passe, 2FA) et le contrôle d’accès par rôles (Direction Générale, chefs de projet, équipes terrain, finance, commerciale, administrateurs).
- Supabase Database (PostgreSQL)
  • Base de données relationnelle pour stocker les projets, les utilisateurs, les rapports et les logs.  
  • Supporte les synchronisations en temps réel (écoute des mises à jour critiques) et les requêtes batch pour les données historiques.
- Supabase Storage
  • Stockage des documents (photos de chantier, export PDF/Excel).  
  • Intégré directement à la gestion des permissions Supabase.
- Edge Functions (Supabase)
  • Fonctions serverless pour les tâches lourdes ou planifiées : génération de rapports PDF/Excel (via des bibliothèques comme PDFKit ou SheetJS), envois email automatiques.
- Connecteurs API externes
  • ERP interne, CRM, Google Sheets/Excel via API pour importer et synchroniser les données.  
  • Webhooks ManyChat pour récupérer et afficher le flux WhatsApp terrain en quasi temps réel.
- Gemini AI (ou GPT-4o)
  • Service d’IA pour analyses prédictives, génération de rapports et assistance contextuelle.  
  • Appels API depuis le frontend et les Edge Functions pour obtenir des synthèses ou des conseils.

L’ensemble de ces composants backend fonctionne en synergie pour assurer la cohérence des données et la modularité des Micro-SaaS.

## 3. Infrastructure et Déploiement

Pour garantir fiabilité, déploiement rapide et évolutivité, nous avons retenu :

- Hébergement Vercel
  • Adapté à Next.js, déploiement continu (CD) automatique à chaque push sur la branche principale.  
  • CDN intégré pour accélérer la diffusion des contenus statiques.
- Git et GitHub
  • Versioning du code, gestion des pull requests et collaboration entre développeurs.
- CI/CD (GitHub Actions ou pipeline Vercel)
  • Tests automatisés (lint, build, tests unitaires) avant chaque déploiement.  
  • Déploiement sur des environnements de staging et de production.
- Monitoring et Logs
  • Supabase Dashboard pour suivre l’usage de la base de données et les performances des Edge Functions.  
  • Intégration possible de Sentry ou LogRocket pour le suivi des erreurs frontend.

Cette infrastructure permet d’atteindre un SLA de 99,5 %, de gérer 50–100 utilisateurs simultanés et d’ajouter des ressources quand la plateforme grandit.

## 4. Third-Party Integrations

La plateforme s’enrichit de services externes pour couvrir tous les besoins :

- ManyChat Webhook
  • Récupère les messages, photos et alertes terrain envoyés depuis WhatsApp.  
  • Affiché dans le widget « Field Feed » du dashboard.
- ERP, CRM et tableurs (Excel/Google Sheets)
  • Connecteurs API pour importer en temps réel les commandes, factures, réservations et données financières.
- Service email (SendGrid/Supabase Mail)
  • Envoi automatique et planifié de rapports PDF/Excel aux destinataires désignés.
- Gemini AI (Google)
  • API pour l’assistant IA flottant (prompt, reporting, analyses prédictives).

Ces intégrations apportent des données fiables et en temps utile, tout en évitant la double saisie.

## 5. Sécurité et Performance

### Sécurité

- Authentification Supabase avec 2FA pour protéger l’accès.  
- Gestion de rôles et permissions détaillée pour chaque Micro-SaaS.  
- Chiffrement des données en transit (HTTPS/TLS) et au repos (sécurité Supabase).  
- Revue régulière des dépendances et mise à jour des correctifs de sécurité.

### Performance

- Rendu SSR/SSG avec Next.js pour réduire les temps de chargement initiaux.  
- Cache CDN (Vercel) et cache interne Supabase pour les requêtes fréquentes.  
- Lazy-loading des composants et des cartes/graphes pour alléger le bundle initial.  
- Pagination ou chargement à la demande sur les listes de projets ou d’alertes.  
- Monitoring des temps de réponse et alertes en cas de dégradation.

Grâce à ces optimisations, les interactions clés restent sous les 2 secondes, même avec plusieurs milliers de projets en base.

## 6. Conclusion et Récapitulatif

PEPPI-SNI repose sur une architecture moderne et modulaire, centrée autour de Supabase et Next.js. Les principales forces de ce choix sont :

- Rapidité de développement et de déploiement grâce aux outils intégrés (Supabase, Vercel, shadcn/ui).  
- Expérience utilisateur fluide et accessible (Tailwind CSS, WCAG 2.1 AA).  
- Scalabilité immédiate (hébergement serverless, base PostgreSQL).  
- Sécurité solide (authentification, chiffrement, gestion des rôles).  
- Richesse fonctionnelle via l’IA (Gemini), les intégrations externes (ERP, ManyChat) et la génération de rapports automatisée.

En combinant ces technologies, PEPPI-SNI offre un « Super-App » fiable et évolutive, répondant aux besoins de pilotage stratégique de la Société Nationale Immobilière du Gabon.