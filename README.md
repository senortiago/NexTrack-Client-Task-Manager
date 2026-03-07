# NexTrack

A full-stack task and project tracking application with client service management, billing, and comprehensive reporting features.

## Features

- **Client Management**: Track and organize all your clients with contact information and company details
- **Project Tracking**: Create and manage projects with active/completed status tracking
- **Task Management**: Organize work into tasks with subtask support (hierarchical task structure)
- **Charge Tracking**: Assign service charges to tasks and projects with flexible discounting
- **Discount Management**: Apply discounts (0-100%) to charges, including full discounts for promotional items
- **Financial Reporting**: Generate detailed financial reports filtered by client or project
  - PDF export with tables and summaries
  - Word document export for easy sharing
  - Real-time discount and revenue calculations
- **Internationalization**: Full support for English and Greek interfaces
- **Dark Mode**: Automatic light/dark/system theme support for enhanced usability
- **Professional Dashboard**: Overview of key metrics including revenue, active projects, and recent clients

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **React Query (TanStack)** - Server state management
- **Wouter** - Lightweight routing
- **React Hook Form** - Form management with Zod validation
- **Next-themes** - Theme management
- **jsPDF + jsPDF-AutoTable** - PDF generation
- **Docx + FileSaver** - Word document generation
- **Lucide React** - Icon library
- **Date-fns** - Date formatting

### Backend
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database access
- **Drizzle-Zod** - Schema validation
- **Express-Session** - Session management
- **Passport.js** - Authentication framework

### Development
- **TypeScript** - Type checking
- **Drizzle Kit** - Database schema management

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn package manager

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nextrack
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/nextrack
SESSION_SECRET=your-secret-key-here
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Database access layer
│   └── vite.ts           # Vite middleware setup
├── shared/               # Shared code between client and server
│   ├── schema.ts         # Database schema and types
│   └── routes.ts         # API route definitions
└── package.json
```

## Database Schema

### Clients
- `id` - Primary key
- `name` - Client name (required)
- `email` - Contact email
- `company` - Company name
- `createdAt` - Creation timestamp

### Projects
- `id` - Primary key
- `clientId` - Reference to client
- `name` - Project name (required)
- `description` - Project description
- `status` - "active" or "completed"
- `createdAt` - Creation timestamp

### Tasks
- `id` - Primary key
- `projectId` - Reference to project
- `parentId` - Reference to parent task (for subtasks)
- `title` - Task title (required)
- `description` - Task description
- `status` - "todo", "in_progress", or "done"
- `createdAt` - Creation timestamp

### Charges
- `id` - Primary key
- `projectId` - Reference to project
- `taskId` - Reference to task (optional)
- `description` - Charge description (required)
- `amount` - Amount in cents (required)
- `discountPercentage` - Discount from 0-100% (default: 0)
- `createdAt` - Creation timestamp

## API Routes

All routes are prefixed with `/api`

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create a new client
- `GET /api/clients/:id` - Get client details
- `PATCH /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Charges
- `GET /api/charges` - List all charges
- `POST /api/charges` - Create a new charge
- `GET /api/charges/:id` - Get charge details
- `PATCH /api/charges/:id` - Update charge
- `DELETE /api/charges/:id` - Delete charge

## Key Features Explained

### Charge Management
Charges are stored in cents and can be associated with either a project or a specific task within a project. This allows for flexible billing at both project and task levels. The `discountPercentage` field supports values from 0 to 100%, where 100% represents a completely free/promotional charge.

### Subtasks
Tasks support a hierarchical structure through the `parentId` field, allowing you to organize complex projects into parent tasks and subtasks. This is useful for breaking down large pieces of work.

### Financial Reports
The reports page provides a comprehensive view of charges with the ability to:
- Filter by client
- Filter by project (filtered based on selected client)
- View real-time calculations of subtotal, discounts, and final total
- Export to PDF or Word format for sharing with stakeholders

### Internationalization
The application includes built-in support for multiple languages. Add new language translations in `client/src/hooks/use-language.tsx` by extending the `translations` object.

### Theme Support
Uses `next-themes` for seamless theme switching. The app respects user system preferences by default but allows manual override.

## Development Notes

### Currency Handling
All monetary amounts are stored as integers representing cents (e.g., $10.50 = 1050). The frontend automatically converts to dollars for display and multiplies by 100 on input.

### Form Validation
Forms use React Hook Form with Zod schemas for validation. All input schemas are defined in `shared/schema.ts` using `createInsertSchema` from `drizzle-zod`.

### State Management
- Server state: React Query (TanStack Query)
- UI state: React hooks (useState)
- Theme state: next-themes
- Language state: Custom context provider

## Contributing

Contributions are welcome! Please ensure:
1. Code follows the existing structure and conventions
2. All new features include appropriate translations in the language hook
3. Database schema changes use `npm run db:push`
4. TypeScript types are properly defined

## License

MIT

---

**NexTrack** - Making project management and client billing simple and efficient.
