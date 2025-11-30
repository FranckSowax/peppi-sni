# Backend Structure Document

This document outlines the backend setup for the PEPPI-SNI platform. It explains how the system is organized, how data is stored and accessed, the APIs that power the frontend, hosting choices, infrastructure components, security practices, and monitoring/maintenance strategies. It’s written in everyday language, so no deep technical background is required.

## 1. Backend Architecture

### Overview
- We use Supabase as our core backend. Supabase provides hosted PostgreSQL, Auth services, Storage, real-time subscriptions, and serverless Edge Functions.  
- The architecture follows a semi-microservice approach by organizing each Micro-SaaS module (Stratégie, Achats/Supply, Chantier/WhatsApp, Finance, Commercial) in its own schema or logical grouping within the same database.  
- Next.js (hosted on Vercel) handles the frontend but also houses serverless functions (API routes) when custom logic is needed outside Supabase Edge Functions.

### Scalability, Maintainability, Performance
- **Scalability:** Supabase autos-scales the database and Edge Functions. Vercel autos-scales frontend serverless functions.  
- **Maintainability:** Clear separation of concerns by module. Schema-based organization in PostgreSQL keeps tables for each module grouped. Role-based access controls ensure modules remain isolated.
- **Performance:**  
  • Real-time updates via Supabase Realtime for critical dashboards.  
  • Caching at the CDN level (Vercel/Cloudflare) for static assets and publicly cacheable data (e.g., landing page).  
  • Edge Functions minimize latency by running logic close to the user.

## 2. Database Management

### Technologies Used
- PostgreSQL (hosted by Supabase) – relational database.  
- Supabase Auth – user authentication and role management.  
- Supabase Storage – file storage for images, documents, attachments.

### Data Structure & Access
- **Relational tables:** Projects, Users, Roles, plus tables for each module (e.g., orders, invoices, messages).  
- **Real-time vs. Batch:**  
  • Real-time: project status, finance updates, alerts, field messages.  
  • Batch: historical reports, automated scheduled exports.
- **Data access:**  
  • Secure Row-Level Security (RLS) policies ensure each role (Direction Générale, project manager, field team, finance, commercial, admin) only sees relevant data.  
  • Supabase client libraries handle queries from the frontend or Edge Functions.

## 3. Database Schema

### Human-Readable Overview
- **Users & Auth**  
  • User: email, password hash managed by Supabase Auth.  
  • Roles: admin, general management, project manager, field team, finance, commercial.  
- **Projects**  
  • Basic info: name, region, phase, status, start/end dates, assigned manager.  
  • Geolocation: latitude, longitude for map display.  
- **Module Data**  
  • Stratégie: KPIs, action plans with statuses.  
  • Achats/Supply: supplier orders, inventory levels, delivery dates.  
  • Chantier/WhatsApp: messages, photos, alerts logged with timestamps.  
  • Finance: budget lines, expenses, invoices linked to projects.  
  • Commercial: sales pipeline, reservations, payments.  
- **Reporting & Alerts**  
  • Reports: generated files (PDF/Excel), schedule info.  
  • Alerts: priority alerts with type, timestamp, project reference.

### SQL Schema (PostgreSQL)
```sql
-- Users and Roles
drop table if exists users, roles cascade;
create table roles (
  id serial primary key,
  name text not null unique
);

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role_id int references roles(id),
  created_at timestamptz default now()
);

-- Projects
drop table if exists projects cascade;
create table projects (
  id serial primary key,
  name text not null,
  region text,
  phase text,
  status text,
  manager_id uuid references users(id),
  latitude numeric,
  longitude numeric,
  start_date date,
  end_date date
);

-- Stratégie Module
drop table if exists strategie_kpis cascade;
create table strategie_kpis (
  id serial primary key,
  project_id int references projects(id),
  kpi_name text,
  target_value numeric,
  current_value numeric,
  updated_at timestamptz default now()
);

-- Achats/Supply Module
drop table if exists supply_orders cascade;
create table supply_orders (
  id serial primary key,
  project_id int references projects(id),
  supplier text,
  item text,
  quantity int,
  status text,
  order_date date,
  delivery_date date
);

drop table if exists inventory_items cascade;
create table inventory_items (
  id serial primary key,
  project_id int references projects(id),
  item_name text,
  quantity_on_hand int
);

-- Chantier/WhatsApp Module
drop table if exists chantier_messages cascade;
create table chantier_messages (
  id serial primary key,
  project_id int references projects(id),
  sender text,
  message_text text,
  media_url text,
  received_at timestamptz default now()
);

-- Finance Module
drop table if exists finances cascade;
create table finances (
  id serial primary key,
  project_id int references projects(id),
  type text check (type in ('budget','expense','invoice')),
  amount numeric,
  currency text,
  record_date date
);

-- Commercial Module
drop table if exists commercial_activities cascade;
create table commercial_activities (
  id serial primary key,
  project_id int references projects(id),
  activity_type text check (activity_type in ('reservation','payment','pipeline')),
  details jsonb,
  record_date date
);

-- Reports & Alerts
drop table if exists reports cascade;
create table reports (
  id serial primary key,
  project_id int references projects(id),
  report_type text,
  file_url text,
  scheduled_for timestamptz,
  generated_at timestamptz default now()
);

drop table if exists alerts cascade;
create table alerts (
  id serial primary key,
  project_id int references projects(id),
  alert_type text,
  message text,
  created_at timestamptz default now()
);
```  
*Note: Supabase Auth tables (users, sessions) are managed automatically.*

## 4. API Design and Endpoints

### Approach
- We rely primarily on Supabase’s auto-generated REST and GraphQL endpoints.  
- For custom business logic (e.g., report generation, ManyChat webhook handling), we use Supabase Edge Functions or Next.js API routes.

### Key Endpoints

| Path                                      | Method | Purpose                                                                                   |
|-------------------------------------------|--------|-------------------------------------------------------------------------------------------|
| /auth/v1/login                            | POST   | User login via Supabase Auth                                                              |
| /auth/v1/logout                           | POST   | User logout                                                                               |
| /rest/v1/projects                         | GET    | List all projects (with filters)                                                          |
| /rest/v1/projects                         | POST   | Create a new project                                                                      |
| /rest/v1/strategie_kpis                   | GET    | Retrieve strategy KPIs for a project                                                      |
| /rest/v1/supply_orders                    | POST   | Place a new supplier order                                                                |
| /rest/v1/chantier_messages                | POST   | Receive new field message (ManyChat webhook)                                              |
| /rest/v1/finances                         | GET    | Fetch finance records (budgets, expenses, invoices)                                       |
| /rest/v1/commercial_activities            | GET    | Retrieve commercial pipeline, reservations, payments                                      |
| /edge-functions/generate-report           | POST   | Trigger PDF/Excel report generation                                                      |
| /edge-functions/send-scheduled-reports    | POST   | Internal scheduler for automated email delivery                                          |

### Real-time Subscriptions
- Supabase Realtime channels on projects, finances, alerts for instant dashboard updates.

## 5. Hosting Solutions

- **Supabase Cloud:**  
  • PostgreSQL database with daily backups.  
  • Auth, Storage, Realtime, Edge Functions all in one platform.  
- **Vercel:**  
  • Hosts the Next.js frontend and any Next.js API routes.  
  • Global CDN for assets, ensuring sub-2-second response times.  

**Benefits:**  
- Reliability: Managed backups and SLAs (99.5% availability).  
- Scalability: Automatic scaling of Edge Functions and database.  
- Cost-effectiveness: Pay-as-you-use serverless and database plans.

## 6. Infrastructure Components

- **Load Balancer / CDN:** Vercel’s global network handles traffic routing and caching.  
- **Edge Functions:** Low-latency serverless logic close to users.  
- **Caching:**  
  • HTTP caching at CDN for static content (landing page, images).  
  • In-memory or Redis caching (optional) for frequently accessed but non-sensitive data.  
- **Content Delivery:** Vercel + Cloudflare (optional) ensures fast asset delivery worldwide.  
- **Webhooks & Message Queue:** ManyChat webhook for WhatsApp integration pushes data into Edge Function for processing.

## 7. Security Measures

- **Authentication & Authorization:**  
  • Supabase Auth with JWT tokens.  
  • Role-Based Access Control (RLS) in PostgreSQL ensures users see only permitted rows.  
- **Data Encryption:**  
  • TLS in transit for all traffic.  
  • Encryption at rest for database and storage.  
- **API Security:**  
  • Edge Functions require service-level API keys.  
  • Rate limiting via Supabase and Vercel to prevent abuse.  
- **Compliance:**  
  • WCAG 2.1 AA on frontend (accessibility).  
  • GDPR-ready data policies (if user data is EU-based).

## 8. Monitoring and Maintenance

- **Monitoring Tools:**  
  • Supabase Dashboard for database performance, query stats, function logs.  
  • Vercel Analytics for frontend performance.  
  • Sentry or Logflare for application error tracking.  
- **Alerts & Notifications:**  
  • Email/Slack alerts on function failures or database anomalies.  
  • Uptime monitoring with third-party services (e.g., UptimeRobot).  
- **Maintenance Strategies:**  
  • Regular dependency updates (monthly).  
  • Daily backups of the database (automated by Supabase).  
  • Quarterly security reviews and penetration tests.

## 9. Conclusion and Overall Backend Summary

PEPPI-SNI’s backend leverages Supabase as a comprehensive, scalable backend platform, combined with Vercel for frontend hosting and Edge Functions. The relational PostgreSQL database is organized by module for clarity and maintainability. Role-based access and real-time subscriptions ensure secure, up-to-date dashboards. Integrated caching, CDNs, and serverless logic deliver performance, while thorough security and monitoring guarantee reliability. This setup aligns perfectly with the project’s goals: a centralized, responsive, and secure Super-App for SNI’s executive team.