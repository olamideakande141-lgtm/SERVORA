# SERVORA installation

## Requirements
- Node.js 20 or newer
- A Supabase project
- GitHub repository and a hosting provider

## Local setup
1. Download or clone the project.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase project URL and anon key.
5. In Supabase SQL Editor, run `supabase/migrations/0001_initial_saas.sql`.
6. Run `npm run dev`.

The current code is an initial SaaS foundation. Do not treat it as production-ready until the remaining security and workflow items in SECURITY.md are completed and tested.
