# App Flow Document for PEPPI-SNI

## Onboarding and Sign-In/Sign-Up

When a new user arrives at the PEPPI-SNI application, they first land on the public institutional page. This landing page is reachable via a branded URL or direct link shared with the Société Nationale Immobilière du Gabon team. From here, the header displays the SNI logo and a prominent “Connexion” button that invites users to authenticate. There is no open self-registration form; instead, access credentials are pre-configured by the system administrator through Supabase, and new users receive their login details by email.

Clicking the “Connexion” button takes the user to the Supabase-powered authentication screen. The user enters their email and password. If two-factor authentication is enabled for their role, a second screen prompts them to enter a time-based one-time code. Supabase validates the credentials and returns the user to the application with their role assigned. If the credentials are invalid, an inline error message appears stating “Identifiants incorrects, veuillez réessayer.” The user remains on the login page until they succeed.

If a user forgets their password, they click a “Mot de passe oublié ?” link under the sign-in form. This takes them to a recovery page where they enter their email address. Supabase sends a password reset email containing a secure link. Clicking that link opens a reset form where the user chooses a new password. Once submitted and confirmed, they are redirected back to the sign-in screen with a success message indicating that they can now log in with their new password.

Upon successful authentication, the user is routed to the global dashboard. A persistent “Déconnexion” button in the header or sidebar allows them to log out at any time. Logging out returns them to the landing page.

## Main Dashboard or Home Page

As soon as the user signs in, the application renders the Global Dashboard. This dashboard layout contains a vertical sidebar on the left, a top bar displaying the live ticker of key figures, and a main content area displaying God-View widgets. The sidebar lists the five Micro-SaaS modules: Stratégie, Achats/Supply, Chantier/WhatsApp, Finance, and Commercial. Each module name is paired with an icon and clicking any entry instantly switches the main content to that module’s view.

The main content area initially shows four synthesizing widgets side by side. The first widget is an interactive map using Mapbox or Leaflet, pinpointing all active project locations. The second widget is a financial health chart built with Recharts or Tremor, showing budgets committed, consumed and forecasted. The third widget is a live feed of WhatsApp messages, photos, and alerts collected via the ManyChat webhook. The fourth widget lists priority alerts aggregated across all modules. Above these widgets, the live ticker updates in real time to scroll metrics such as total active projects, budget consumed, total revenue realized, average project progress, and urgent alerts count.

From this home view users can navigate back to the landing page by clicking the SNI logo in the header or log out via the sidebar’s “Déconnexion” link. The responsive design ensures the sidebar collapses into a hamburger menu on smaller screens, while the live ticker becomes a horizontal scroll bar at the bottom.

## Detailed Feature Flows and Page Transitions

### Strategy Module Flow
When the user clicks “Stratégie” in the sidebar, the main view transitions to the Strategy module. This page presents strategic KPIs, objectives, and action plans. The top of the page displays filters to select timeframes or strategic themes. Below, data tables and charts show progress on each objective. The user can click an objective row to open a detailed side panel that displays historical metrics, related projects, and a commentary section. Saving changes to objectives triggers a Supabase update request and refreshes all strategy charts.

### Achats/Supply Module Flow
Selecting “Achats/Supply” replaces the main area with an order management interface. A toolbar at the top offers quick creation of a new purchase order. Below, a paginated table lists existing orders with status indicators. Clicking an order opens a modal showing contract details, delivery schedule, and linked invoices. The user can update delivery dates or approve invoices. These actions call Supabase RPC functions to sync with external ERP or CRM systems in real time. Confirmations appear as toast notifications upon success.

### Chantier/WhatsApp Module Flow
When the user accesses “Chantier/WhatsApp,” the view loads a two-column layout. The left column is a live WhatsApp feed showing incoming messages and images from field teams. The right column lists ongoing projects with status badges. Clicking a project row filters the feed to that project’s messages. The user can upload photos or leave notes via a form at the bottom, which pushes data through the ManyChat webhook and updates the feed. Photo uploads go to Supabase Storage and display thumbnails in the feed instantly.

### Finance Module Flow
The “Finance” module displays a dashboard of budgets, expenses, invoices, and payments. At the top is a filter for date ranges and project selection. Below are charts and data tables showing expenses by category, payment statuses, and forecast variances. Clicking an invoice entry opens a drawer to mark it as paid or dispute it. Actions trigger Supabase updates and push notifications to relevant users. A button labeled “Exporter Excel” downloads the current table view as an .xlsx file.

### Commercial Module Flow
Clicking “Commercial” navigates to the sales pipeline interface. The top section lists filters for sales stage, region, or client segment. Beneath, a Kanban board groups deals by stage. The user can drag and drop deals between columns, updating their status in Supabase. Detailed deal cards are accessible by clicking the deal name, revealing contracts, client contacts, and payment schedules. A “Générer PDF” button in the detail view produces a proposal document that can be emailed directly from the interface.

### Interactive Map Full-Screen Flow
At any moment, the user can click the expand icon on the map widget in the Global Dashboard or within any module that includes the map. This opens the map in full-screen mode. A floating toolbar provides filters by status, region, phase, manager, or operation type. Additional layers such as infrastructure overlays or real-time alert markers can be toggled on and off. Exiting full-screen returns the user to their previous context without losing any applied filters.

### Floating AI Assistant Flow
A Gemini-branded assistant icon floats in the lower right corner of every screen. Clicking it slides out a chat panel. The panel offers prompt suggestions like “Générer un rapport financier mensuel” or “Analyser le retard des projets.” The user types or selects a suggestion, and the assistant queries Supabase data in real time. The response appears as text and can optionally render charts or tables directly in the chat window. The user can export this content as PDF or embed it into the dashboard. Closing the chat panel returns focus to the main view.

### Report Generation and Scheduling Flow
In any module or the global dashboard, the user clicks a “Rapports” button in the top bar. A modal appears letting them choose between PDF or Excel, select sections (project advancement, finances, alerts), and define the date range. They can either download immediately or switch to a scheduling tab where they pick a cadence (hebdomadaire or mensuelle) and recipient roles (Direction Générale, chefs de projet, finance). Saving the schedule stores the settings in Supabase and triggers automated email delivery at the next scheduled date. Confirmation toasts indicate success.

## Settings and Account Management

Users access their personal settings by clicking their avatar in the sidebar header and selecting “Profil et Préférences.” The Profile page allows them to update their name, email, and password. A separate Notifications tab lets them toggle email or in-app alerts for module updates, critical alerts, and report deliveries.

Administrators have an additional “Administration” link in the sidebar. This page lists user accounts and roles. Administrators can invite new users by email, assign roles, or deactivate accounts. Role changes propagate immediately, altering the user’s view and access permissions across all modules.

All settings pages include a “Retour au Dashboard” link at the top, ensuring users can easily navigate back to their previous context.

## Error States and Alternate Paths

If the application loses network connectivity or Supabase is unreachable, a full-screen banner appears stating “Connexion interrompue. Reconquête…” and automatically retries in the background. Users can still view cached widgets until connectivity is restored. For invalid form submissions, inline validation highlights errors in red and displays messages such as “Ce champ est requis” or “Format de date invalide.”

When attempting restricted actions, such as a chef de projet trying to access the Finance module, a modal informs them “Accès refusé : privilèges insuffisants.” The user can click “Retour” to go back to their permitted modules. If a scheduled report fails to send, an email is dispatched to administrators with details and a link to retry the job.

In the rare case of server errors (500) during key actions, a global error component shows “Une erreur inattendue est survenue. Veuillez réessayer plus tard.” Users can click a “Rapporter ce problème” link that opens a pre-filled support request form.

## Conclusion and Overall App Journey

A typical user journey begins on the public landing page where an executive quickly logs in using Supabase authentication. Immediately, they see the Global Dashboard with real-time widgets and the live ticker. They might then click into the Finance module to review budget consumption, use the AI assistant to generate a PDF summary for the board, and schedule the report for weekly distribution. A project manager switches to the Achats/Supply module to approve a supplier invoice, while a site supervisor monitors field updates in the Chantier/WhatsApp module. At any point, both can expand the interactive map for geographic insights or adjust notification preferences in their profile settings. Administrators seamlessly manage user roles in the Administration panel. Throughout the entire flow, responsive design and error handling ensure each action feels reliable, fast, and accessible, guiding every user from sign-in to decision-making within a unified, modular Super-App experience.