# NexTrack - Client Service Management

## Overview
Full-stack task/project tracking app for client service management built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn/UI, TanStack Query, Wouter
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **PDF Export**: jsPDF + jspdf-autotable with Noto Sans Unicode font (fetched from CDN, cached in-memory)
- **Word Export**: docx + file-saver
- **Theme**: next-themes (light/dark/system)
- **i18n**: Custom LanguageProvider in `client/src/hooks/use-language.tsx` (6 languages: DE, EL, EN, ES, FR, IT)
- **Currency**: CurrencyProvider in `client/src/hooks/use-currency.tsx` (13 currencies)
- **Branding**: BrandingProvider in `client/src/hooks/use-branding.tsx` (customizable app name + logo)

## Key Files
- `shared/schema.ts` - Database schema (clients, projects, tasks, charges) and Zod validation
- `server/routes.ts` - REST API routes for all CRUD operations
- `server/storage.ts` - Database access layer (IStorage interface)
- `client/src/App.tsx` - Root component with providers (ThemeProvider, LanguageProvider, CurrencyProvider, BrandingProvider, QueryClient)
- `client/src/components/layout/app-sidebar.tsx` - Navigation sidebar with branding and i18n
- `client/src/pages/reports/index.tsx` - Reports page with PDF/Word export
- `client/src/pages/settings.tsx` - Branding, language, currency, and theme settings
- `client/src/hooks/use-language.tsx` - i18n system with translations for 6 languages
- `client/src/hooks/use-currency.tsx` - Currency provider with Intl.NumberFormat formatting
- `client/src/hooks/use-branding.tsx` - App name and logo provider (localStorage-based)
- `client/src/lib/format.ts` - Discount calculation utilities

## Data Model
- **Amounts**: Stored in cents (integer); frontend divides by 100 for display
- **Discounts**: 0-100%; 100% = fully discounted (shown dimmed in reports)
- **Subtasks**: Tasks use `parentId` (self-referential) for hierarchy
- **Charges**: Linked to project (required) and optionally to a task

## Branding
- `useBranding()` hook provides `appName`, `setAppName`, `logoUrl`, `setLogoUrl`
- Default app name: "NexTrack"; default logo: Briefcase icon
- Logo stored as base64 data URL in localStorage (`app-logo`), max 512 KB
- App name stored in localStorage (`app-name`)
- Used in sidebar header and customizable via Settings page

## i18n
- Languages: German (de), Greek (el), English (en), Spanish (es), French (fr), Italian (it)
- Translation keys in `use-language.tsx` — ~185+ keys per language
- `date-fns` locale imports: `de, el, enUS, es, fr, it` for localized date formatting
- Language selector in Settings shows native names (e.g. "Deutsch (German)")

## Currency
- 13 currencies covering all supported language regions
- `useCurrency()` hook provides `formatMoney(cents)`, `currencySymbol`, `currency`, `setCurrency`
- Uses `Intl.NumberFormat` with selected currency code for proper formatting
- Persisted in localStorage as `app-currency`

## PDF Unicode Font Handling
- Noto Sans Regular + Bold TTF fetched from jsDelivr CDN at export time
- Fonts cached in module-level variable (`cachedFonts`) after first download
- Registered via jsPDF `addFileToVFS`/`addFont` API
- Falls back to Helvetica with user toast notification if font fetch fails

## Running
- `npm run dev` starts Express backend + Vite frontend on port 5000
- `npm run db:push` pushes schema changes to PostgreSQL
