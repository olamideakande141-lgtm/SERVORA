# Security and production readiness

This repository is a foundation, not a security certification or finished production SaaS.

Before launch:
- Review all RLS policies with separate platform admin, owner, staff and customer test accounts.
- Restrict public service discovery to active services for the correct business.
- Implement a transactional booking RPC that locks or checks availability to prevent double booking.
- Ensure customer booking creation cannot impersonate another customer or business.
- Add verified server-side payment webhooks with signature verification and idempotency.
- Provision platform admins only through trusted server-side operations.
- Add rate limiting, abuse protection, audit logs and monitoring.
- Configure email verification, password recovery and allowed redirect URLs.
- Add backups, retention and incident response procedures.
- Review privacy, consumer and tax obligations in the countries where the SaaS operates.

Never commit `.env.local`, passwords, provider secrets or Supabase service-role keys.
