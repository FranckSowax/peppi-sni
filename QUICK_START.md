# 🚀 PEPPI-SNI Quick Start Guide

## What Has Been Done

✅ **Project Initialized Successfully!**

The PEPPI-SNI platform foundation is ready with:
- Next.js 14 with TypeScript
- Tailwind CSS with SNI color palette
- All core dependencies installed
- Project structure established
- Build verified and passing

## What You Need to Do Next

### Step 1: Set Up Supabase (Required)

1. **Create a Supabase Account**
   - Go to https://supabase.com
   - Sign up or log in

2. **Create a New Project**
   - Click "New Project"
   - Choose organization
   - Set project name: `peppi-sni`
   - Set database password (save it securely!)
   - Choose region: closest to Gabon (e.g., `eu-west-1`)
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Your API Credentials**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` (looks like: https://xxxxx.supabase.co)
     - `anon public` key (long string starting with eyJ...)

4. **Configure Environment Variables**
   ```bash
   # In your project root, create .env.local
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
   ```

### Step 2: Set Up Database Schema

1. **Open Supabase SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New Query"

2. **Run the Database Schema**
   - Copy the SQL from `documentation/backend_structure_document.md` (lines 56-169)
   - Paste into SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

3. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should see: users, roles, projects, and module tables

### Step 3: Start Development

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser!

## Project Structure Overview

```
peppi-sni/
├── app/                    # Next.js pages and routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components (to be built)
├── lib/                   # Utilities and configs
│   └── utils.ts          # Helper functions
├── documentation/         # Full project documentation
│   ├── tasks.json        # Implementation roadmap
│   ├── project_requirements_document.md
│   ├── tech_stack_document.md
│   └── ... (more docs)
├── .env.example          # Environment template
├── README.md             # Full documentation
├── PROJECT_STATUS.md     # Current progress
└── QUICK_START.md        # This file
```

## Implementation Roadmap

Follow the tasks in `documentation/tasks.json`:

1. ✅ **Task 1**: Project Setup & Authentication (In Progress)
2. **Task 2**: Landing Page & UI Components
3. **Task 3**: Global Dashboard & Widgets
4. **Task 4**: Micro-SaaS Module Skeletons
5. **Task 5**: AI Assistant & Reporting

## Key Features to Build

### 🏠 Landing Page
- Institutional header with SNI logo
- 5 interactive module cards
- Live ticker with key metrics
- Footer with legal links

### 📊 Dashboard
- Collapsible sidebar navigation
- Interactive project map (Mapbox/Leaflet)
- Financial health charts (Recharts)
- WhatsApp field feed (ManyChat)
- Priority alerts widget

### 🔐 Authentication
- Email/password login
- Optional 2FA
- Role-based access (6 user types)

### 🤖 AI Features
- Gemini-powered assistant
- Automated report generation (PDF/Excel)
- Email scheduling

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Check code quality

# Add UI Components (shadcn/ui)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu

# Database (Supabase)
npx supabase init        # Initialize local Supabase
npx supabase start       # Start local instance
npx supabase db push     # Push migrations
```

## Design System

### Colors
- **Primary**: Orange gradient `#f5821f` → `#a44c0d`
- **Secondary**: Blue `#00529b`
- **Neutrals**: Grays for backgrounds and text

### Typography
- **Font**: Inter (already configured)
- **Base size**: 16px

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support

## Getting Help

### Documentation
- 📖 Full README: `README.md`
- 📊 Project Status: `PROJECT_STATUS.md`
- 📋 Tasks: `documentation/tasks.json`
- 🎨 Frontend Guidelines: `documentation/frontend_guidelines_document.md`
- 🔧 Backend Structure: `documentation/backend_structure_document.md`

### Resources
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Recharts: https://recharts.org

## Common Issues & Solutions

### Issue: Build fails
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Supabase connection fails
- Check `.env.local` file exists
- Verify credentials are correct
- Ensure no extra spaces in environment variables
- Restart dev server after changing .env.local

### Issue: TypeScript errors
```bash
# Solution: Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Next Development Steps

1. **Configure Supabase** (see Step 1 above)
2. **Set up authentication** (Task 1, Subtasks 4-5)
3. **Build landing page** (Task 2)
4. **Create dashboard layout** (Task 3)
5. **Develop module skeletons** (Task 4)
6. **Integrate AI & reporting** (Task 5)

## Success Criteria

✅ Project builds without errors  
✅ Dev server runs on http://localhost:3000  
⏳ Supabase connected (next step)  
⏳ Authentication working (upcoming)  
⏳ Landing page complete (upcoming)  
⏳ Dashboard functional (upcoming)  

---

**Ready to start?** Follow Step 1 above to set up Supabase! 🚀
