# Frontend Guideline Document

## 1. Frontend Architecture

### 1.1 Overview
Our frontend is built on Next.js 14 (App Router) with TypeScript. We use Tailwind CSS for styling and shadcn/ui for ready-made, accessible UI components. Icons come from Lucide React Icons. Charts use Recharts or Tremor, and maps use either Mapbox GL JS or React-Leaflet depending on requirements.

### 1.2 Scalability
- **Modular folder structure**: Separate `components/`, `app/`, `styles/`, and `lib/` keeps code easy to navigate as the app grows.
- **Server and client components**: Next.js App Router lets us fetch data on the server for heavy tasks, then hydrate minimal client components for fast interactions.
- **Lazy loading**: Non-critical modules (charts, maps, AI assistant) load only when needed.

### 1.3 Maintainability
- **TypeScript**: Enforces consistent types and early error catching.
- **shadcn/ui**: Standardizes component APIs and accessibility patterns.
- **Tailwind config**: Central theme tokens (colors, fonts) are defined once in `tailwind.config.js`.

### 1.4 Performance
- **Automatic code splitting**: Next.js splits each route into its own chunk.
- **Image optimization**: Using Next.js `<Image>` component.
- **Caching and ISR**: We leverage incremental static regeneration and server-side caching for data that changes less often.

## 2. Design Principles

### 2.1 Usability
- Simple, clear navigation with a sidebar and top header.
- Interactive cards on the landing page guide users to each micro-SaaS module.
- Live ticker and map filters update in real time for quick insights.

### 2.2 Accessibility (WCAG 2.1 AA)
- High contrast ratios for text and interactive elements.
- Keyboard-navigable menus and forms.
- ARIA attributes on custom components.

### 2.3 Responsiveness
- Mobile-first layout with Tailwind’s responsive utilities.
- Layout breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
- Collapsible sidebar on small screens, accessible via a hamburger menu.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Tailwind CSS** (utility-first) eliminates naming conflicts and speeds up styling.
- No separate CSS files—styles live alongside components or in a shared `styles/` folder.

### 3.2 Theme Configuration
In `tailwind.config.js` we extend the theme:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#f5821f',       // Orange gradient start
        'primary-dark': '#a44c0d', // Orange gradient end
        secondary: '#00529b',      // Blue accent
        gray: {
          100: '#f5f5f5',
          900: '#111111'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  }
}
```

### 3.3 Visual Style
- **Modern flat design** with subtle shadows and rounded corners.
- **Glassmorphism** accents on cards (semi-transparent backgrounds, light blur) for depth without clutter.

### 3.4 Color Palette
- Primary gradient: `#f5821f` → `#a44c0d`
- Secondary: `#00529b`
- Neutrals: whites and shades of gray for backgrounds, borders, and text.

### 3.5 Typography
- **Font**: Inter (system fallback: sans-serif).
- **Base size**: 16px, with scalable `rem` units.
- **Headings**: Bold variants, accessible line-height.

## 4. Component Structure

### 4.1 Organization
```
/components
  /ui         # Generic UI bits (Button, Modal, Input)
  /layout     # AppShell, Header, Sidebar, Footer
  /dashboard  # Widgets: MapWidget, ChartWidget, Ticker
  /modules    # Strategy, Supply, Field, Finance, Commercial components
/app
  /page.tsx   # Landing, Dashboard, Module routes
/lib          # API wrappers (Supabase, Gemini, ManyChat)
/styles       # Global styles or utility overrides
```

### 4.2 Reusability
- **Atomic components** (`Button`, `Card`) power more complex ones (`ProjectCard`, `ReportCard`).
- **Props-driven**: Components accept data and callback props rather than hard-coding behavior.

### 4.3 Benefits of Componentization
- Single source of truth for UI elements.
- Easier testing and isolation.
- Faster onboarding for new developers—components are documented and typed.

## 5. State Management

### 5.1 Approach
- **Server data** fetched via Next.js server components or React Query (for client-side interactive widgets).
- **Global UI state** (theme, sidebar open/closed) managed with React Context.
- **Authentication state** handled by a custom `AuthContext` wrapping Supabase Auth.

### 5.2 Data Flow
1. Server component fetches initial data from Supabase.
2. Passes down props or hydrates React Query caches.
3. Client components read/write from Query cache or Context.
4. On mutations (e.g., create order), we invalidate queries to keep data fresh.

## 6. Routing and Navigation

### 6.1 Next.js App Router
- **File-system based routing** under `/app`. Each folder with `page.tsx` becomes a route.
- **Dynamic routes** for project details: `/modules/finance/[projectId]/page.tsx`.

### 6.2 Protected Routes
- Middleware checks Supabase Auth cookie on each request.
- Redirects unauthenticated users to `/login`.
- Role-based guards in `getServerSideProps` or server components.

### 6.3 Navigation Structure
- **Sidebar**: Icons+labels for Dashboard, Stratégie, Achats/Supply, Chantier, Finance, Commercial.
- **Breadcrumbs**: Show path inside a module.
- **Top header**: User profile menu, AI assistant trigger, notifications.

## 7. Performance Optimization

- **Lazy Loading**: `dynamic(() => import('./ChartWidget'))` for heavy components.
- **Code Splitting**: Automatic via Next.js; manually split large shared components if necessary.
- **Image & Asset Optimization**: Next.js `<Image>` and built-in optimization.
- **Batching & Debouncing**: Limit frequent state updates (e.g., map filters).
- **HTTP Caching**: Use `Cache-Control`, ISR, and stale-while-revalidate for slow-changing data.

## 8. Testing and Quality Assurance

### 8.1 Unit Tests
- **Jest** with **React Testing Library** for components.
- Mock Supabase & Gemini APIs via **msw** (Mock Service Worker).

### 8.2 Integration Tests
- Test flows: login → dashboard load → module navigation.
- Verify role-based access control and widget rendering.

### 8.3 End-to-End Tests
- **Cypress** for user journeys: authentication, data filtering, report export.

### 8.4 Code Quality
- **ESLint** with TypeScript rules, **Prettier** for formatting.
- **Pre-commit hooks** (Husky) to run lint and tests before push.

## 9. External Integrations

### 9.1 Supabase
- Auth, Postgres DB, storage for documents and reports.
- Real-time subscriptions (e.g., priority alerts).

### 9.2 Gemini AI
- Chat interface embedded as a floating component.
- Uses a wrapper in `lib/gemini.ts` to fetch summaries, reports, predictive insights.

### 9.3 ManyChat Webhook
- Fetches field WhatsApp feed and displays it under Chantier module.
- Polling or webhook-driven updates via a serverless function.

### 9.4 Maps & Charts
- **Mapbox GL JS** or **React-Leaflet** for interactive project maps and filters.
- **Recharts** or **Tremor** for financial health and KPI charts.

## 10. Conclusion and Overall Frontend Summary
This guideline outlines our frontend setup for PEPPI-SNI: a robust, scalable Next.js + TypeScript architecture, guided by usability, accessibility, and responsiveness. Tailwind CSS and shadcn/ui keep styling consistent, while componentization and TypeScript ensure maintainability. State management via server components, React Context, and React Query delivers a snappy user experience. We secure data with Supabase Auth and protect routes at the middleware level. Performance optimizations, thorough testing, and CI checks guarantee a reliable platform. Finally, integrations with Gemini, ManyChat, Mapbox/Leaflet, and Recharts/Tremor create a unified, interactive interface that meets the Direction Générale’s decision-making needs.