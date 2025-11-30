# PEPPI-SNI - Plateforme de Pilotage SNI

Plateforme centralisée de pilotage et de visualisation des projets immobiliers pour la Société Nationale Immobilière du Gabon.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React Icons
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Data Visualization**: Recharts/Tremor
- **Maps**: Mapbox GL JS / Leaflet
- **AI**: Gemini API
- **Integrations**: ManyChat (WhatsApp)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Gemini API key (optional for AI features)

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

3. Configure your environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard and modules
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard widgets
│   └── modules/          # Module-specific components
├── lib/                  # Utility functions and configs
│   ├── supabase/        # Supabase client
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
└── documentation/       # Project documentation

```

## 🎯 Features

### Core Modules
- **Stratégie**: KPI tracking and action plan management
- **Achats/Supply**: Order management and inventory tracking
- **Chantier/WhatsApp**: Field updates via WhatsApp integration
- **Finance**: Budget tracking and invoice management
- **Commercial**: Sales pipeline and reservation management

### Dashboard Features
- Interactive project map with filters
- Real-time financial health charts
- Live WhatsApp field feed
- Priority alerts system
- AI-powered assistant (Gemini)
- PDF/Excel report generation
- Automated email scheduling

## 🔐 Authentication

The platform uses Supabase Auth with:
- Email/password authentication
- Optional 2FA (TOTP)
- Role-based access control (RBAC)

### User Roles
- Direction Générale
- Chef de projet
- Équipe terrain
- Finance
- Commercial
- Administrateur

## 📊 Database Schema

See `documentation/backend_structure_document.md` for detailed database schema and API endpoints.

## 🎨 Design System

- **Primary Colors**: Orange gradient (#f5821f → #a44c0d)
- **Secondary Color**: Blue (#00529b)
- **Typography**: Inter font family
- **Accessibility**: WCAG 2.1 AA compliant

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build
```

## 📚 Documentation

Detailed documentation is available in the `/documentation` folder:
- `project_requirements_document.md` - Complete PRD
- `tech_stack_document.md` - Technology choices
- `frontend_guidelines_document.md` - Frontend architecture
- `backend_structure_document.md` - Backend structure
- `app_flow_document.md` - User flows
- `security_guideline_document.md` - Security practices
- `tasks.json` - Implementation tasks

## 🚀 Deployment

The application is designed to be deployed on:
- **Frontend**: Vercel
- **Backend**: Supabase Cloud

## 📝 License

Private - Société Nationale Immobilière du Gabon

## 👥 Support

For support and questions, contact the development team.
