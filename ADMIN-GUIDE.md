# Administration guide

## Business owner
A business owner creates a workspace, configures business details, adds services and manages staff. Each business has a separate business ID and membership list.

## Platform administrator
Platform administrator accounts are provisioned through a trusted server-side process. Never add a public admin signup form. The initial migration intentionally does not create a platform admin.

## Subscription plans
Platform administrators manage plans in `subscription_plans`. Each plan supports monthly and yearly prices, currency, features and JSON usage limits. A subscription becomes active only after a trusted payment confirmation or a deliberately configured trial.
