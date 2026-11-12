# SERVORA

Multi-business business management and appointment booking SaaS.

## Stack
- React + TypeScript + Vite
- Supabase Auth and PostgreSQL
- Row Level Security tenant isolation
- Monthly and yearly subscription schema

## Start
```bash
npm install
cp .env.example .env.local
npm run dev
```

Configure Supabase and run the SQL migration in `supabase/migrations`.

## Current delivery status
This is the initial application foundation: responsive marketing pages, signup/login wiring, a business workspace creation flow, and a multi-tenant database/subscription schema.

It is **not yet the complete production application**. Booking workflows, full owner/platform admin panels, customer pages, payment provider integration, verified webhook handlers, transactional double-booking protection, email notifications and comprehensive security tests still need implementation.
