# Zen (DayStream)

## Overview

DayStream is a full-stack daily productivity application that combines task scheduling, habit tracking, and journaling into a unified experience. The app features a React frontend with a Node.js/Express backend, using Firebase for data storage and authentication, with PostgreSQL for session management via Replit Auth.

The application provides users with:
- Time-based task scheduling with a day view
- Daily habit tracking with streak management
- Journal entries with mood tracking
- Inspirational quote display

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with CSS variables for theming, custom design system based on shadcn/ui components
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Dashboard, Landing, NotFound)
- Reusable UI components in `client/src/components/ui/` (shadcn/ui library)
- Feature components in `client/src/components/` (TaskModal, HabitTracker, DailyJournal, QuoteBanner)
- Custom hooks in `client/src/hooks/` for data fetching and business logic

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation
- **Database**: Firebase Firestore for primary data storage (tasks, habits, journal entries)
- **Session Storage**: PostgreSQL with Drizzle ORM for Replit Auth sessions

The backend uses a storage abstraction pattern (`server/storage.ts`) with a `FirestoreStorage` class implementing the `IStorage` interface, allowing for easy database swapping.

### Authentication
- **Primary Auth**: Replit Auth integration via OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Auth Routes**: Handled in `server/replit_integrations/auth/`

### Shared Code
- `shared/schema.ts`: Zod schemas for data models (Task, Habit, JournalEntry, User)
- `shared/routes.ts`: API route definitions with input/output schemas
- `shared/models/auth.ts`: Drizzle schema for users and sessions tables

### Key Design Decisions

1. **Dual Database Strategy**: Firebase Firestore for application data (real-time capabilities, NoSQL flexibility) and PostgreSQL for session management (required by Replit Auth)

2. **Type-Safe API Layer**: Zod schemas shared between client and server ensure runtime validation and TypeScript type inference

3. **Component Library**: shadcn/ui provides accessible, customizable UI primitives that can be modified directly in the codebase

4. **Date-Based Data Model**: Tasks and journal entries are organized by date strings (YYYY-MM-DD format) for easy querying and display

## External Dependencies

### Database Services
- **Firebase Firestore**: Primary data store for tasks, habits, and journal entries
- **PostgreSQL**: Session storage for Replit Auth (configured via `DATABASE_URL` environment variable)

### Authentication
- **Replit Auth**: OpenID Connect-based authentication
- **Firebase Auth**: Client-side auth initialization (configured via `VITE_FIREBASE_*` environment variables)

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string for sessions
- `SESSION_SECRET`: Secret for session encryption
- `VITE_FIREBASE_API_KEY`: Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID`: Firebase app ID

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: PostgreSQL ORM and migrations
- `firebase-admin`: Server-side Firebase SDK
- `@tanstack/react-query`: Data fetching and caching
- `date-fns`: Date manipulation
- `framer-motion`: Animations
- `zod`: Schema validation