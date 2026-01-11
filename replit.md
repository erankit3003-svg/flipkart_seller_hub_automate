# Flipkart Seller Hub API Automation Software

## Overview

A production-ready SaaS platform designed for Flipkart sellers to automate order handling, inventory control, invoicing, analytics, and returns tracking. The application provides a comprehensive dashboard for managing e-commerce operations with AI-powered seller intelligence features.

Key capabilities include:
- Order management with lifecycle tracking (CREATED → PACKED → SHIPPED → DELIVERED)
- Real-time inventory control with low-stock alerts
- Returns tracking for RTO and customer returns
- Analytics dashboard with sales reports
- AI-powered assistant for seller intelligence
- GST-compliant invoice generation (mocked)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state caching and synchronization
- **Styling**: Tailwind CSS with Shadcn UI component library
- **Charts**: Recharts for analytics visualizations
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful endpoints defined in `server/routes.ts`
- **Shared Types**: Zod schemas in `shared/routes.ts` for type-safe API contracts
- **Build System**: Vite for frontend, esbuild for server bundling

### Authentication
- **Provider**: Replit Auth (OIDC-based)
- **Session Storage**: PostgreSQL-backed sessions via `connect-pg-simple`
- **Implementation**: Passport.js with OpenID Connect strategy
- **Protected Routes**: Middleware-based route protection

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Zod schema integration
- **Schema Location**: `shared/schema.ts` with model-specific files in `shared/models/`
- **Migrations**: Drizzle Kit (`npm run db:push`)

### AI Integration
- **Provider**: OpenAI via Replit AI Integrations
- **Features**: 
  - Chat-based seller assistant (`server/replit_integrations/chat/`)
  - Image generation capabilities (`server/replit_integrations/image/`)
  - Batch processing utilities with rate limiting (`server/replit_integrations/batch/`)

### Project Structure
```
client/src/           # React frontend
  components/         # UI components (Shadcn-based)
  hooks/              # Custom React hooks for API calls
  pages/              # Page components
  lib/                # Utilities and query client

server/               # Express backend
  replit_integrations/  # Auth, chat, image AI modules
  routes.ts           # API endpoint definitions
  storage.ts          # Database operations
  db.ts               # Database connection

shared/               # Shared between frontend/backend
  schema.ts           # Drizzle database schemas
  routes.ts           # API route definitions with Zod types
  models/             # Domain-specific models (auth, chat)
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable

### Authentication Services
- **Replit Auth**: OIDC provider for user authentication
- **Required env vars**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
- **Required env vars**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Flipkart Integration (To Be Implemented)
- **Flipkart Seller Hub APIs**: Order Management APIs (OMAPI)
- **OAuth endpoint**: `https://api.flipkart.net/oauth-service/oauth/token`
- **Configuration**: Stored in settings table (clientId, clientSecret, sandbox mode)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `openid-client` / `passport`: Authentication
- `openai`: AI integration
- `recharts`: Analytics charts
- `date-fns`: Date formatting