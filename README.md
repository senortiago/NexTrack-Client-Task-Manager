# NexTrack

A fullstack task and project tracking application for client service management, built with React, Express, and PostgreSQL.

## Features

- **Client Management**: Track and organize clients with contact information and company details
- **Project Tracking**: Create and manage projects with active/completed status tracking
- **Task Management**: Organize work into tasks with subtask support (hierarchical structure)
- **Charge Tracking**: Assign service charges to tasks and projects with flexible discounting (0–100%)
- **Financial Reporting**: Generate detailed PDF and Word reports filtered by client or project
- **Internationalization**: 6 languages — German, Greek, English, Spanish, French, Italian
- **Currency Support**: 13 currencies with locale-aware formatting
- **Theming**: Light, dark, and system theme modes
- **Branding**: Customizable app name and logo

## Tech Stack

| Layer      | Technologies                                                         |
|------------|----------------------------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query |
| Backend    | Express.js, Drizzle ORM, PostgreSQL                                  |
| Reports    | jsPDF + jsPDF-AutoTable (PDF), docx + FileSaver (Word)               |

---

## Quick Start with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.

### Step 1 — Clone the repository

```bash
git clone <your-repo-url> nextrack
cd nextrack
```

### Step 2 — Start the database

```bash
docker compose up db -d
```

This starts a PostgreSQL 16 container with a persistent volume (`pgdata`). Your data is preserved across container restarts.

Wait a few seconds for the database to become healthy before proceeding.

### Step 3 — Run the database migration

```bash
docker compose --profile setup run --rm migrate
```

This pushes the Drizzle schema to PostgreSQL, creating all required tables (clients, projects, tasks, charges). You only need to run this once on first setup, or again after schema changes.

### Step 4 — Build and start the application

```bash
docker compose up app --build -d
```

### Step 5 — Open the application

Visit [http://localhost:5000](http://localhost:5000) in your browser. The app is ready to use.

### All-in-one command

To start everything in a single command (useful for first-time setup or after schema changes):

```bash
docker compose --profile setup run --rm migrate && docker compose up app --build -d
```

### Stopping the application

```bash
docker compose down
```

To also delete the database volume and all stored data:

```bash
docker compose down -v
```

---

## Docker Compose Services

| Service   | Description                          | Port |
|-----------|--------------------------------------|------|
| `db`      | PostgreSQL 16 with persistent volume | 5432 |
| `app`     | NexTrack production server           | 5000 |
| `migrate` | One-shot schema migration (on-demand)| —    |

## Environment Variables

| Variable       | Default                                          | Description               |
|----------------|--------------------------------------------------|---------------------------|
| `DATABASE_URL` | `postgresql://nextrack:nextrack@db:5432/nextrack` | PostgreSQL connection URL |
| `PORT`         | `5000`                                           | Application server port   |

### Customizing database credentials

Edit the `environment` section in `docker-compose.yml` for both the `db` and `app` services. Make sure the `DATABASE_URL` in the `app` and `migrate` services matches the credentials set in the `db` service.

---

## Development (without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Clone the repository:

```bash
git clone <your-repo-url> nextrack
cd nextrack
```

2. Install dependencies:

```bash
npm install
```

3. Set the database connection string:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/nextrack"
```

4. Push the database schema:

```bash
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:5000](http://localhost:5000) with hot reload enabled.

### Available scripts

| Script           | Description                                |
|------------------|--------------------------------------------|
| `npm run dev`    | Start development server with hot reload   |
| `npm run build`  | Build frontend and backend for production  |
| `npm start`      | Run the production build                   |
| `npm run check`  | Run TypeScript type checking               |
| `npm run db:push`| Push database schema changes to PostgreSQL |

### Building for production (manual)

```bash
npm run build
export DATABASE_URL="postgresql://user:password@localhost:5432/nextrack"
NODE_ENV=production node dist/index.cjs
```

---

## Project Structure

```
├── client/src/              # React frontend
│   ├── components/          # UI components (Shadcn + custom)
│   ├── hooks/               # Custom hooks (i18n, currency, branding, theme)
│   ├── pages/               # Page components
│   └── lib/                 # Utilities (query client, formatting)
├── server/                  # Express backend
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # Database access layer
│   └── db.ts                # Database connection
├── shared/                  # Shared between frontend and backend
│   └── schema.ts            # Drizzle schema + Zod validation
├── Dockerfile               # Multi-stage Docker build
├── docker-compose.yml       # Docker Compose configuration
└── drizzle.config.ts        # Drizzle Kit configuration
```

## Database Schema

### Clients
- `id` — Primary key
- `name` — Client name (required)
- `email` — Contact email
- `company` — Company name
- `createdAt` — Creation timestamp

### Projects
- `id` — Primary key
- `clientId` — Reference to client
- `name` — Project name (required)
- `description` — Project description
- `status` — "active" or "completed"
- `createdAt` — Creation timestamp

### Tasks
- `id` — Primary key
- `projectId` — Reference to project
- `parentId` — Reference to parent task (for subtasks)
- `title` — Task title (required)
- `description` — Task description
- `status` — "todo", "in_progress", or "done"
- `createdAt` — Creation timestamp

### Charges
- `id` — Primary key
- `projectId` — Reference to project
- `taskId` — Reference to task (optional)
- `description` — Charge description (required)
- `amount` — Amount in cents (required)
- `discountPercentage` — Discount from 0–100% (default: 0)
- `createdAt` — Creation timestamp

## API Routes

All routes are prefixed with `/api`.

| Method   | Endpoint              | Description         |
|----------|-----------------------|---------------------|
| `GET`    | `/api/clients`        | List all clients    |
| `POST`   | `/api/clients`        | Create a client     |
| `GET`    | `/api/clients/:id`    | Get client details  |
| `PATCH`  | `/api/clients/:id`    | Update a client     |
| `DELETE` | `/api/clients/:id`    | Delete a client     |
| `GET`    | `/api/projects`       | List all projects   |
| `POST`   | `/api/projects`       | Create a project    |
| `GET`    | `/api/projects/:id`   | Get project details |
| `PATCH`  | `/api/projects/:id`   | Update a project    |
| `DELETE` | `/api/projects/:id`   | Delete a project    |
| `GET`    | `/api/tasks`          | List all tasks      |
| `POST`   | `/api/tasks`          | Create a task       |
| `GET`    | `/api/tasks/:id`      | Get task details    |
| `PATCH`  | `/api/tasks/:id`      | Update a task       |
| `DELETE` | `/api/tasks/:id`      | Delete a task       |
| `GET`    | `/api/charges`        | List all charges    |
| `POST`   | `/api/charges`        | Create a charge     |
| `GET`    | `/api/charges/:id`    | Get charge details  |
| `PATCH`  | `/api/charges/:id`    | Update a charge     |
| `DELETE` | `/api/charges/:id`    | Delete a charge     |

## License

MIT
