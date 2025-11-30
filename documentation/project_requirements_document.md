# Project Requirements Document (PRD)

## 1. Project Overview

PEPPI-SNI is a centralized “Super-App” (a Meta-SaaS) for the Société Nationale Immobilière du Gabon. It serves as a single entry point to monitor, pilot, and visualize all ongoing real-estate projects. The platform groups five specialized micro-SaaS modules—Stratégie, Achats/Supply, Chantier/WhatsApp, Finance, and Commercial—behind a public landing page and a secured global dashboard for the executive team. Executive users get a real-time overview of key metrics, instant access to each module, and an AI assistant to generate reports or answer data queries.

The driving goal is to streamline decision-making at the Direction Générale by consolidating data from multiple systems (ERP, CRM, spreadsheets, WhatsApp field feeds) into one cohesive interface. Success is measured by user adoption (50–100 simultaneous users), sub-2-second response times for main views, 99.5% uptime, compliance with WCAG 2.1 AA accessibility standards, and the ability to generate and schedule PDF/Excel reports automatically.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)

*   Public landing page with:

    *   Institutional header (logo, title, login button)
    *   Interactive module cards for the five micro-SaaS
    *   Live ticker scrolling key metrics (projects, budget, alerts)
    *   Institutional footer (legal links, contacts)

*   Secure authentication via Supabase Auth (email + optional 2FA)

*   Global dashboard layout:

    *   Collapsible sidebar for module navigation
    *   Four “god-view” widgets: Project Map, Financial Health chart, Field Feed (WhatsApp), Priority Alerts

*   Module skeletons with core flows:

    *   Stratégie: KPI tracking, action plan status
    *   Achats/Supply: supplier orders, inventory, deliveries
    *   Chantier/WhatsApp: field updates via ManyChat webhook
    *   Finance: budgets, expenses, invoices
    *   Commercial: pipeline, reservations, payments

*   Floating AI assistant (Gemini) for on-demand data queries & report generation

*   PDF/Excel report export & email scheduling (weekly/monthly)

*   Responsive design (desktop/tablet/mobile), WCAG 2.1 AA compliance

*   Zoomable, filterable interactive map (Mapbox/Leaflet) with project layers

### Out-of-Scope (Later Phases)

*   Deep customizations per micro-SaaS beyond skeleton flows (e.g., advanced CRM features)
*   Offline mode or native mobile apps (React Native/Swift)
*   Multi-tenant support (only SNI users)
*   Complex predictive analytics or machine-learning pipelines beyond basic AI prompts
*   Integration with additional third-party services not specified (e.g., GIS data vendors)

## 3. User Flow

A new user lands on the public PEPPI-SNI portal and sees an institutional header with the SNI logo, title, and a prominent “Connexion” button. Below, an animated live ticker scrolls key performance figures (e.g., active projects, budget consumed, urgent alerts). In the center, five cards represent each micro-SaaS module; clicking any card or the “Connexion” button redirects to the secure login screen. The footer at the bottom provides legal links and contact details.

After logging in (email + password, optional 2FA), the user arrives at the Global Dashboard. A left sidebar lists the five modules; clicking a module instantly updates the main view. By default, the main view shows four widgets: a map of project sites with interactive filters, a financial health chart, a real-time WhatsApp field feed, and priority alerts. A floating AI assistant icon (“Gemini”) sits in the corner—clicking it opens a chat panel for on-the-fly queries or report requests. At any time, the user can expand any widget, generate a PDF/Excel report, or schedule automatic email sends.

## 4. Core Features

*   **Landing Page**

    *   Header (logo, project title, login button)
    *   Module grid: clickable cards for Stratégie, Achats/Supply, Chantier/WhatsApp, Finance, Commercial
    *   Live ticker: key metrics updated in real time
    *   Footer: legal, contacts

*   **Authentication & Access Control**

    *   Supabase Auth with email/password + optional MFA
    *   Role-based permissions (Direction Générale, Chef de projet, Équipe terrain, Finance, Commercial, Administrateur)

*   **Global Dashboard**

    *   Sidebar navigation for modules

    *   Widgets:

        *   ProjectMapWidget (filter by status, region, phase, responsible, type)
        *   FinancialHealthWidget (Recharts/Tremor charts)
        *   FieldFeedWidget (WhatsApp via ManyChat webhook)
        *   PriorityAlertsWidget

*   **Micro-SaaS Modules**

    *   Stratégie: KPI dashboard, action plan tracker
    *   Achats/Supply: order management, stock levels, supplier contracts
    *   Chantier/WhatsApp: milestone tracking, photo uploads, incident reports
    *   Finance: budget vs. actual, invoice tracking, payment status
    *   Commercial: lead pipeline, reservation management, payment tracking

*   **AI Assistant (Gemini)**

    *   Prompt suggestions, real-time data analysis
    *   Report generation (PDF/Excel) embedded with charts
    *   Predictive queries (e.g., forecast delays, cost overruns)

*   **Reporting & Scheduling**

    *   On-demand PDF/Excel exports
    *   Email scheduling: weekly/monthly, role-based recipient lists

*   **Interactive Map & Live Ticker**

    *   Map filters & contextual layers (infrastructure, alerts)
    *   Ticker metrics: total projects, active chantiers, budget engaged/consumed, revenue, average progress, delivered units, current alerts

*   **Responsive & Accessible UI**

    *   Tailwind CSS + shadcn/ui components
    *   Color palette: orange gradients (#f5821f → #a44c0d), blue (#00529b)
    *   WCAG 2.1 AA compliance (contrast ratios, keyboard nav, screen-reader labels)

## 5. Tech Stack & Tools

*   **Frontend**

    *   Next.js 14 (App Router)
    *   TypeScript
    *   Tailwind CSS
    *   shadcn/ui components
    *   Lucide React Icons

*   **Backend & Storage**

    *   Supabase (Auth, PostgreSQL database, Storage)
    *   Supabase Functions or Edge Functions for custom logic

*   **Data Visualization**

    *   Recharts or Tremor for charts
    *   Mapbox GL JS or Leaflet (React bindings) for maps

*   **AI & Automation**

    *   Gemini (via API) or GPT-4o for in-app assistant
    *   ManyChat webhook for WhatsApp integration

*   **Reporting & Email**

    *   PDF generation library (e.g., Puppeteer or PDFKit)
    *   Excel export (e.g., SheetJS)
    *   Email service (e.g., SendGrid, Postmark)

*   **IDE & Developer Tools**

    *   VS Code with Cursor.ai or Windsurf plugin for AI-assisted coding
    *   GitHub Actions for CI/CD

## 6. Non-Functional Requirements

*   **Performance**

    *   Sub-2-second load for main dashboard views
    *   Real-time or near-real-time updates (map, ticker, widgets)

*   **Scalability & Availability**

    *   Support 50–100 concurrent users
    *   SLA: 99.5% uptime

*   **Security & Compliance**

    *   OWASP Top 10 protections (XSS, SQLi, CSRF)
    *   Supabase Auth + optional 2FA
    *   Role-based access control
    *   Data encryption at rest and in transit (SSL/TLS)

*   **Accessibility**

    *   WCAG 2.1 AA standards: color contrast, keyboard navigation, ARIA labels

*   **Usability**

    *   Mobile/tablet/desktop responsive layouts
    *   Intuitive navigation and consistent design language

## 7. Constraints & Assumptions

*   **Supabase Dependency**: Requires Supabase availability for auth, data, storage.
*   **AI Model Availability**: Gemini or GPT-4o must be accessible via API with sufficient quota.
*   **WhatsApp Integration**: Relies on ManyChat webhook reliability and message rate limits.
*   **Third-Party APIs**: ERP/CRM connectors must provide REST or GraphQL endpoints.
*   **Data Volumes**: Assumes moderate dataset (thousands of projects/documents), not millions.
*   **User Base**: 50–100 known user accounts, no open sign-up.

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits**

    *   ERP/CRM or ManyChat could throttle requests.
    *   Mitigation: implement request caching, exponential back-off, batch syncing for non-critical data.

*   **Map Performance**

    *   Large numbers of markers can slow rendering.
    *   Mitigation: cluster markers, lazy-load layers, use vector tiles.

*   **Report Generation Load**

    *   Generating large PDF/Excel files on demand can spike CPU usage.
    *   Mitigation: offload to background workers or Supabase Edge Functions; limit report size.

*   **AI Query Ambiguity**

    *   Users may phrase requests unclearly, leading to irrelevant responses.
    *   Mitigation: provide prompt templates and guided suggestions in the assistant UI.

*   **Data Consistency**

    *   Real-time vs. batch sync could lead to stale or inconsistent views.
    *   Mitigation: clearly label data freshness, allow manual refresh, document sync cadences.

*   **Accessibility Oversights**

    *   Complex charts or maps may not be fully screen-reader friendly.
    *   Mitigation: supply text alternatives and ARIA attributes for key UI elements.

This PRD lays out a clear, unambiguous blueprint for PEPPI-SNI’s first release. It ensures that subsequent documents—detailed tech stack, frontend guidelines, backend structure, flowcharts, and security rules—can be derived directly without further clarification.
