# Task Manager - Full-Stack Application

A modern, full-stack task management application built with Next.js 15, Prisma, PostgreSQL, and NextAuth.js.

> 🌐 **Live Demo**: [https://task-manager-infodasher.vercel.app](https://task-manager-infodasher.vercel.app)

## 🔑 Demo Credentials

```
Email: demo@example.com
Password: password123
```

---

## 🚀 Features

- **Authentication**: Secure user registration and login with NextAuth.js v5
- **Projects Management**: Create, read, update, and delete projects
- **Tasks Management**: Full CRUD operations for tasks within projects
- **Kanban Board**: Drag-and-drop task management with status columns (bonus)
- **Dark Mode**: Theme toggle with system preference support (bonus)
- **URL State Persistence**: View preferences survive page refresh
- **Search & Filtering**: Search projects/tasks with status and priority filters
- **Pagination**: Efficient data loading with paginated API responses
- **Unit Tests**: Validation and component tests with Vitest (bonus)
- **API Documentation**: Comprehensive endpoint documentation (bonus)
- **Docker Support**: Containerized deployment ready (bonus)
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Type Safety**: Full TypeScript implementation with Zod validation

## 🛠 Tech Stack

| Layer          | Technology                   |
| -------------- | ---------------------------- |
| Framework      | Next.js 15 (App Router)      |
| Database       | PostgreSQL (Neon compatible) |
| ORM            | Prisma                       |
| Authentication | NextAuth.js v5               |
| Validation     | Zod                          |
| Styling        | Tailwind CSS                 |
| Theming        | next-themes                  |
| Drag & Drop    | @hello-pangea/dnd            |
| Data Fetching  | React Query (TanStack Query) |
| Testing        | Vitest + Testing Library     |
| Language       | TypeScript                   |

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)
- npm or yarn

## 🏁 Getting Started

### 1. Clone and Install

```bash
cd task-manager
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database URL - PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager?schema=public"

# NextAuth Secret - Generate with: openssl rand -base64 32
AUTH_SECRET="your-super-secret-key"

# NextAuth URL
AUTH_URL="http://localhost:3000"
```

### 3. Database Setup

Generate Prisma client and push schema to database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

### 4. Seed Demo Data

```bash
npm run db:seed
```

This creates a demo user and sample projects/tasks:

- **Email**: `demo@example.com`
- **Password**: `password123`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth route group (login, register)
│   ├── (dashboard)/         # Dashboard route group (protected)
│   │   └── dashboard/
│   │       ├── projects/    # Projects pages
│   │       └── tasks/       # Tasks pages
│   └── api/                 # API routes
│       ├── auth/            # Auth endpoints
│       ├── projects/        # Projects CRUD
│       └── tasks/           # Tasks CRUD
├── components/
│   ├── layout/              # Layout components
│   └── ui/                  # UI primitives
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   ├── utils.ts             # Utility functions
│   └── validations.ts       # Zod schemas
└── types/                   # TypeScript types
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                  | Description       |
| ------ | ------------------------- | ----------------- |
| POST   | `/api/auth/register`      | Register new user |
| POST   | `/api/auth/[...nextauth]` | NextAuth handlers |

### Projects

| Method | Endpoint             | Description                           |
| ------ | -------------------- | ------------------------------------- |
| GET    | `/api/projects`      | List projects (paginated, searchable) |
| POST   | `/api/projects`      | Create project                        |
| GET    | `/api/projects/[id]` | Get project with tasks                |
| PUT    | `/api/projects/[id]` | Update project                        |
| DELETE | `/api/projects/[id]` | Delete project                        |

### Tasks

| Method | Endpoint                   | Description                            |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/api/tasks`               | List all tasks (paginated, filterable) |
| POST   | `/api/tasks`               | Create task                            |
| POST   | `/api/projects/[id]/tasks` | Create task (nested)                   |
| GET    | `/api/tasks/[id]`          | Get task                               |
| PUT    | `/api/tasks/[id]`          | Update task                            |
| DELETE | `/api/tasks/[id]`          | Delete task                            |

### Query Parameters

**Projects**: `?page=1&limit=10&search=keyword&status=ACTIVE&sortBy=createdAt&sortOrder=desc`

**Tasks**: `?page=1&limit=10&search=keyword&status=TODO&priority=HIGH&projectId=xxx`

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based session management via NextAuth
- Server-side ownership enforcement on all queries
- Input validation with Zod schemas
- Protected API routes with session checks

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## 🐳 Docker Setup (Optional)

Build and run with Docker:

```bash
docker-compose up -d
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (your Neon PostgreSQL URL)
   - `AUTH_SECRET` (generate a secure secret)
   - `AUTH_URL` (your production URL)
4. Deploy!

### Database (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`
4. Run migrations: `npm run db:migrate`

## 📝 Design Decisions

### Why Prisma over Drizzle?

- Better developer experience with auto-generated types
- Simpler migrations workflow
- More extensive documentation and community support

### Why NextAuth over manual JWT?

- Battle-tested security
- Built-in session management
- Easy to extend with additional providers

### Why React Query?

- Automatic caching and refetching
- Optimistic updates capability
- Loading/error states out of the box

## ⚖️ Trade-offs & Intentional Omissions

### Current Scope (By Design)

| Feature                  | Status     | Rationale                                                   |
| ------------------------ | ---------- | ----------------------------------------------------------- |
| Refresh token rotation   | ❌ Omitted | Overkill for assignment scope; session expiry is sufficient |
| Role-based access (RBAC) | ❌ Omitted | Single-user ownership model meets requirements              |
| Real-time updates        | ❌ Omitted | Would add WebSockets/Pusher for production                  |
| Email verification       | ❌ Omitted | Would add Resend/SendGrid for production                    |
| File uploads             | ❌ Omitted | Would add S3/Cloudinary if needed                           |

### If I Had More Time

- Add real-time collaborative editing with WebSockets
- Add keyboard shortcuts for power users
- Implement task due date reminders/notifications
- Add user avatar uploads with S3/Cloudinary
- Implement role-based access control for team collaboration

## 📄 License

MIT
