# GiffCash

GiffCash is a working loan-management MVP for customer onboarding, credit applications, approvals, disbursements, repayments, dashboards, and audit trails.

The first version intentionally uses only Node.js built-in modules. It has no third-party runtime dependencies, making it easy to inspect, run, test, and deploy while the product rules are still being refined.

## Included

- Secure scrypt password hashing
- HttpOnly, SameSite session cookies
- CSRF protection for state-changing requests
- Role-based permissions for administrators, loan officers, approvers, and cashiers
- Customer registration with duplicate identity and phone checks
- Loan creation and flat-rate calculations using integer pesewas
- Controlled workflow: draft, submitted, approved or declined, disbursed, active, closed
- Repayment recording and automatic balance updates
- Dashboard metrics and recent applications
- Immutable-style audit events for important actions
- Atomic JSON persistence for local MVP use
- Responsive staff interface
- Docker support and automated tests

## Run locally

```bash
cp .env.example .env
node --env-file=.env server.js
```

Open `http://localhost:3000`.

Demo login: `admin@giffcash.local` / `ChangeMe123!`

Other roles use `officer@giffcash.local`, `approver@giffcash.local`, and `cashier@giffcash.local` with the same development password.

## Test

```bash
npm test
npm run check
```

## Docker

```bash
export ADMIN_PASSWORD='replace-with-a-strong-password'
docker compose up --build
```

Runtime data is stored as integer pesewas in `data/giffcash.json`, which is excluded from Git. Before handling real financial data, migrate persistence to PostgreSQL and add an immutable double-entry ledger, external secrets management, encrypted backups, monitoring, penetration testing, and institution-specific compliance controls.

See [the roadmap](docs/ROADMAP.md) for subsequent phases.
