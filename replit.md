# NexTrack - Client Service Management

## Overview
Full-stack task/project tracking app for client service management built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React 18, Vite, Tailwind CSS, Shadcn/UI, TanStack Query, Wouter
- **Backend**: Express.js, Drizzle ORM, PostgreSQL
- **PDF Export**: jsPDF + jspdf-autotable with Noto Sans Unicode font (fetched from CDN, cached in-memory)
- **Word Export**: docx + file-saver
- **Theme**: next-themes (light/dark/system)
- **i18n**: Custom LanguageProvider in `client/src/hooks/use-language.tsx` (English/Greek)

## Key Files
- `shared/schema.ts` - Database schema (clients, projects, tasks, charges) and Zod validation
- `server/routes.ts` - REST API routes for all CRUD operations
- `server/storage.ts` - Database access layer (IStorage interface)
- `client/src/App.tsx` - Root component with providers (ThemeProvider, LanguageProvider, QueryClient)
- `client/src/components/layout/app-sidebar.tsx` - Navigation sidebar with i18n
- `client/src/pages/reports/index.tsx` - Reports page with PDF/Word export
- `client/src/pages/settings.tsx` - Language and theme settings
- `client/src/hooks/use-language.tsx` - i18n system with translations object
- `client/src/lib/format.ts` - Money formatting and discount calculation utilities

## Data Model
- **Amounts**: Stored in cents (integer); frontend divides by 100 for display
- **Discounts**: 0-100%; 100% = fully discounted (shown dimmed in reports)
- **Subtasks**: Tasks use `parentId` (self-referential) for hierarchy
- **Charges**: Linked to project (required) and optionally to a task

## PDF Unicode Font Handling
- Noto Sans Regular + Bold TTF fetched from jsDelivr CDN at export time
- Fonts cached in module-level variable (`cachedFonts`) after first download
- Registered via jsPDF `addFileToVFS`/`addFont` API
- Falls back to Helvetica with user toast notification if font fetch fails

## Running
- `npm run dev` starts Express backend + Vite frontend on port 5000
- `npm run db:push` pushes schema changes to PostgreSQL
