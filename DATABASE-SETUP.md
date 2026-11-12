# Database setup

The initial multi-tenant schema is in `supabase/migrations/0001_initial_saas.sql`.

It creates businesses, business memberships, services, bookings, business hours, blocked dates, subscription plans, monthly/yearly subscriptions, payment records, invoices, events and supporting content tables.

Run the migration only in a fresh development Supabase project first. Back up existing data before applying schema changes to any existing project.

The `create_business_workspace` RPC creates a business and assigns the authenticated user as its owner. Test it with two separate user accounts to verify tenant isolation.
