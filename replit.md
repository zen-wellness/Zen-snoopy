# Zen (DayStream)

## Overview

Zen is a full-stack daily productivity application that combines task scheduling, habit tracking, and journaling into a unified experience. The app features a React frontend with a Node.js/Express backend and uses Firebase for authentication. Users can manage time-based tasks, track daily habits with streak management, write journal entries with mood tracking, and view inspirational quotes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with CSS variables for theming, shadcn/ui component library
- **Build Tool**: Vite with hot module replacement
- **Animations**: Framer Motion for smooth UI transitions

The frontend follows a component-based architecture:
- Pages in `client/src/pages/` (Dashboard, Landing, NotFound)
- Reusable UI components in `client/src/components/ui/` (shadcn/ui library)
- Feature components in `client/src/components/` (TaskList, TaskModal, HabitTracker, DailyJournal, QuoteBanner)
- Custom hooks in `client/src/hooks/` for data fetching and authentication

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Authentication**: Firebase Admin SDK for token verification on the server

The backend uses a storage abstraction pattern (`server/storage.ts`) with a `DatabaseStorage` class implementing the `IStorage` interface for all CRUD operations.

### Authentication
- **Client-side**: Firebase Auth with Google sign-in (popup with redirect fallback)
- **Server-side**: Firebase Admin SDK verifies JWT tokens from Authorization headers
- **User sync**: Users are automatically created/updated in the database upon authentication

### Shared Code
- `shared/schema.ts`: Drizzle table definitions and Zod schemas for users, tasks, habits, habit logs, and journal entries
- `shared/routes.ts`: API route definitions with input/output validation schemas

### Key Design Decisions
1. **Type-safe API contracts**: Zod schemas in `shared/routes.ts` ensure consistent validation between client and server
2. **Optimistic updates**: React Query handles caching and invalidation for responsive UI
3. **Firebase + PostgreSQL hybrid**: Firebase handles authentication while PostgreSQL stores application data via Drizzle ORM
4. **Storage abstraction**: The `IStorage` interface allows swapping database implementations without changing route handlers

## External Dependencies

### Database
- **PostgreSQL**: Primary data storage via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations (`db:push` script)

### Authentication
- **Firebase Authentication**: Google sign-in on the client
- **Firebase Admin SDK**: Server-side token verification
- **Required env vars**: `VITE_FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT` (JSON string)

### Firebase Configuration
Client-side Firebase is configured with hardcoded values in `client/src/lib/firebase.ts`. The server uses `FIREBASE_SERVICE_ACCOUNT` environment variable containing the service account JSON.

### UI Libraries
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **date-fns**: Date manipulation utilities