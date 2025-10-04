# FixIt – Local Service Booking Platform

FixIt is a full-stack marketplace that connects households with vetted local service providers for cleaning, HVAC, plumbing, electrical work and more. Customers can browse listings, request bookings, and leave reviews. Providers manage availability, confirm jobs, and track their schedules. Admins approve new providers and oversee marketplace quality.

## Features

- 🔐 **Authentication & Roles** – Supabase Auth with email/password, session management, and roles for `USER`, `PROVIDER`, and `ADMIN`.
- 🧭 **Service Discovery** – Landing page with search, category filters, pagination, and responsive cards showcasing provider details.
- 📅 **Booking Workflow** – Real-time availability selection, conflict prevention, optimistic status updates, and cancellation rules.
- 🛠️ **Provider Dashboard** – Manage listings, publish availability windows, and confirm/cancel incoming booking requests.
- 🧑‍⚖️ **Admin Console** – Approve provider applications and audit the service catalog.
- ⭐ **Reviews & Ratings** – Post-completion feedback updates service ratings atomically.
- 🧪 **Quality Gates** – Vitest unit tests for booking overlap logic, status transitions, and review permissions.
- 🧰 **Developer Experience** – Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, ESLint, Prettier, and Supabase SQL migrations.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query.
- **Backend:** Supabase (Postgres + Auth + RLS) accessed via Next.js Route Handlers and Server Actions.
- **State Management:** Server components, URL params, TanStack Query cache.
- **Testing:** Vitest + React Testing Library (unit tests).
- **Tooling:** ESLint, Prettier, ts-node seed scripts.

## Project Structure

```
app/                # Next.js App Router pages & API routes
components/         # Reusable UI building blocks
lib/                # Supabase helpers, auth utilities, booking logic
supabase/sql/       # Database schema, policies, helper functions
scripts/            # Seed script for demo data
tests/              # Vitest suites for core booking logic
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase project (free tier works great)

### Environment Variables

Copy `.env.example` and populate with your Supabase project credentials:

```
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` – Service role key (server only; keep secret)

### Install Dependencies

```
pnpm install
```

### Database Setup

1. Create a new Supabase project.
2. Run the SQL migration to provision tables, policies, and helper functions:

```
supabase db push --file supabase/sql/schema.sql
```

3. (Optional) Load demo data using the seed script:

```
SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... pnpm seed
```

### Running the App

- **Development:** `pnpm dev` (http://localhost:3000)
- **Production build:** `pnpm build` then `pnpm start`

### Testing

```
pnpm test
```

### Linting

```
pnpm lint
```

### Deployment

- Deploy to Vercel.
- Configure the environment variables in Vercel project settings.
- Ensure Supabase redirect URLs include the production domain for auth callbacks.

## Supabase Policies Overview

- Users can view and update only their profile; role changes restricted to admins via trigger.
- Services and availability are managed solely by the owning provider; marketplace read access is public.
- Bookings obey RLS: users see their own, providers see theirs, and updates check permitted status transitions.
- Reviews can only be inserted by the booking owner after completion; a Postgres function updates aggregate rating.

## Docs & Screenshots

Screens to capture for presentations (use Vercel preview or `pnpm dev`):

- `docs/screens.md` *(create screenshots for)*
  - Landing page hero + featured services
  - Services list with filters applied
  - Service detail booking drawer
  - User bookings dashboard
  - Provider dashboard incoming requests
  - Admin approval queue

## AI Support Explanation

IBM Granite was used during development to accelerate code generation, refactoring, and documentation drafts. The generated code was reviewed, refined, and validated before inclusion; the production build contains only audited, deterministic code.

## Submission Checklist

- [x] Next.js App Router project with Tailwind, shadcn/ui, TanStack Query
- [x] Supabase auth integration with role-based routes
- [x] Booking workflow with availability + conflict checks
- [x] Provider dashboard & admin console
- [x] RESTful API routes & SQL schema with RLS
- [x] Seed script and environment templates
- [x] Vitest unit coverage for booking logic
- [x] Documentation & deployment guidance
