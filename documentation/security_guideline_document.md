# PEPPI-SNI: Step-by-Step Implementation Plan
This roadmap breaks down the work into iterative phases, embedding security, performance, and accessibility by design.

---

## Phase 1 – Discovery & Detailed Planning

1. Stakeholder Workshops
   • Validate feature set, user roles, non-functional objectives (2 s load, WCAG 2.1 AA, SLA 99.5%)
   • Identify integration points: ERP, CRM, Google Sheets, ManyChat, Gemini
2. Requirements Finalization
   • Prioritize features (MoSCoW)
   • Define success metrics (uptime, response times, concurrency)
3. Security & Compliance Kickoff
   • Perform high-level threat modeling (OWASP Top 10)
   • Document data classification (PII, financial, operational)
   • Establish secure defaults and least-privilege policy
4. Architecture Blueprint
   • High-level diagrams: network, services, data flows
   • Define multi-tenant considerations (if any) and data isolation

---

## Phase 2 – Architecture & Detailed Design

1. System Architecture
   • Next.js 14 App Router + TypeScript frontend
   • Supabase backend (Auth, Postgres, Storage)
   • Mapbox/Leaflet, Recharts/Tremor
   • Gemini & ManyChat webhooks

2. Security Controls Design
   • Authentication: Supabase Auth + optional 2FA, strong password policy (bcrypt/Argon2)
   • Authorization: RBAC matrix per role, server-side enforcement
   • Secure session management: HttpOnly, Secure, SameSite cookies
   • CSRF: synchronizer tokens
   • CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
   • Input validation: Zod/schema on API and UI

3. Data Model & APIs
   • Define Postgres schema for projects, modules, metrics, roles
   • REST/GraphQL (or RPC) interface conventions
   • Pagination, filtering, allow-lists for redirects

4. CI/CD & Environment Strategy
   • Git branching: trunk-based or Gitflow
   • Use lockfiles and SCA tools (Dependabot, Snyk)
   • Environments: dev, staging, prod; secure secrets via Vault/AWS Secrets Manager

---

## Phase 3 – Environment Provisioning & DevOps

1. Infrastructure as Code (IaC)
   • Terraform/CloudFormation for VPC, subnets, RDS (if used), Supabase provisioning
   • Harden server configs, disable unused ports/services
2. CI/CD Pipeline
   • Linting, type checking, unit tests (Jest), security scans (SAST/SCA)
   • Build and deploy Next.js to Vercel/Cloud provider
   • GitHub Actions / GitLab CI for automatic rollouts
3. Secrets Management
   • No hard-coded secrets; pull from Vault or provider secrets store
4. Monitoring & Logging
   • Integrate observability: Prometheus/Grafana or hosted APM (Datadog)
   • Centralize logs, set alert thresholds (error rate, response time)
   • Implement rate limiting (API gateway or middleware)

---

## Phase 4 – Core Platform & Security Hardening

1. Authentication & Authorization
   • Implement Supabase Auth flows (sign-up, login, logout)
   • Enforce password complexity, rate-limit login attempts
   • Build role management dashboard (Admins only)
2. Session & Token Security
   • Secure cookies, validate JWT `exp`, `aud`, `iss`
   • Protect against session fixation, implement logout everywhere
3. Global Security Headers
   • Apply CSP with strict script/style sources, frame-ancestors none
   • Enable HSTS (max-age, includeSubDomains)

4. Error Handling & Logging
   • Centralized error handler; do not leak stack traces in prod
   • Mask PII in logs, log at appropriate levels

---

## Phase 5 – Frontend & Backend Foundations

1. UI Framework & Theming
   • Install Tailwind CSS with `@shadcn/ui` components
   • Configure design tokens: orange gradient (#f5821f→#a44c0d), blue (#00529b)
   • Ensure responsive breakpoints and base WCAG contrast

2. Layout & Navigation
   • Public landing page: header, footer, hero, module cards
   • Authenticated layout: sidebar, top nav, global dashboard shell
   • Implement accessible navigation (ARIA roles, focus management)

3. Data Layer & API Hooks
   • Use React Query or SWR for data fetching with built-in caching
   • Centralize API client with request/response interceptors (attach auth token, handle 401)

4. Supabase Schema & Access Policies
   • Create tables: users, roles, projects, modules, metrics, reports
   • Row-level security (RLS) policies for data isolation by role

---

## Phase 6 – Micro-SaaS Module Development

Iterate each module in sprints (2–3 weeks):

1. Stratégie
   • KPI tracking UI, action plan status
   • APIs: CRUD for KPIs, action plans, permissions checks
2. Achats/Supply
   • Order management: list, create, update, delete
   • Inventory tracking with stock thresholds & alerts
3. Chantier/WhatsApp
   • Webhook endpoint for ManyChat → Supabase insert
   • Real-time feed widget with WebSocket or polling
4. Finance
   • Budget vs. expense dashboards
   • Invoice upload (secure file storage), server-side virus scan
   • Data encryption at rest (Supabase handles PG encryption by default)
5. Commercial
   • Sales pipeline kanban, reservation management
   • Role-based data visibility (e.g., only commercial team sees leads)

Security for each module:
   • Input validation (Zod)
   • Parameterized queries / ORM to prevent injection
   • Output encoding in UI (prevent XSS)
   • Rate limi­­ting for sensitive endpoints

---

## Phase 7 – Integration & Synchronization

1. External Systems Connectors
   • Build secure API clients or ETL jobs for ERP, CRM, Sheets
   • Real-time via webhooks or change data capture (CDC)
   • Batch jobs with validation, error handling, retry logic
2. Data Consistency
   • Use unique IDs, versioning, and idempotent endpoints
   • Monitor sync lag; alert if > threshold
3. Interactive Map & Filters
   • Integrate Mapbox/Leaflet, cluster markers for performance
   • Allow-list of filter values from backend to prevent injection
4. Live Ticker
   • Socket.io or Supabase Realtime subscription
   • Throttle updates to prevent UI thrashing

---

## Phase 8 – AI Assistant & Reporting

1. Gemini Integration
   • Secure API calls with rate limiting
   • Context window management, prompt injection protection
   • Store prompts & obfuscate PII
2. Report Generation
   • Use serverless functions to assemble PDF/Excel (e.g., Puppeteer, SheetJS)
   • Scan inputs, sanitize filenames, store in private bucket
   • Scheduling service (Cron) with email (SendGrid/Mailgun)
   • Pre-signed URLs for downloads (time-limited)
3. Access Control
   • Only authorized roles can generate or download reports

---

## Phase 9 – Testing & Validation

1. Automated Testing
   • Unit tests for business logic (Jest)
   • Integration tests for APIs (Supertest, Postman/Newman)
   • E2E tests (Playwright, Cypress)
2. Security Testing
   • Static Analysis (SAST): ESLint, security plugins
   • Dynamic Analysis (DAST): OWASP ZAP or Burp Suite
   • Dependency scanning (SCA): Snyk, Dependabot alerts
   • Penetration test engagement (3rd party)
3. Performance & Load Testing
   • k6 or JMeter for concurrent user simulations (50–100 users)
   • Lighthouse audits for Core Web Vitals (<2 s)
4. Accessibility Audits
   • axe-core, Lighthouse WCAG checks
   • Manual keyboard/tab navigation tests

---

## Phase 10 – Deployment, Monitoring & Maintenance

1. Production Rollout
   • Blue/Green or Canary deployment
   • Post-deploy smoke tests
2. Monitoring & Alerting
   • Uptime monitoring (Pingdom, UptimeRobot)
   • Logs & metrics dashboards with alert rules
3. Incident Response Plan
   • Define runbooks for common failures (DB down, API errors)
4. Regular Reviews & Updates
   • Monthly dependency updates, quarterly security reviews
   • Refresh penetration tests annually
   • SLA reviews and performance tuning

---

### Conclusion
This plan embeds security and quality throughout the lifecycle. Each phase includes dedicated security, compliance, and performance tasks to ensure PEPPI-SNI is robust, resilient, and aligned with SNI’s objectives.