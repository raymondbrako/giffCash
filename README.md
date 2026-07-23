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

## Requirements

- Node.js 20 or newer

## Run locally

```bash
cp .env.example .env
node --env-file=.env server.js
```

Open `http://localhost:3000`.

Development users share the password configured by `ADMIN_PASSWORD`. With the example environment file:

| Role | Email |
| --- | --- |
| Administrator | `admin@giffcash.local` |
| Loan officer | `officer@giffcash.local` |
| Approver | `approver@giffcash.local` |
| Cashier | `cashier@giffcash.local` |

The example password is `ChangeMe123!`. Change it before using the application beyond local development.

## Test

```bash
npm test
npm run check
```

## Run with Docker

```bash
export ADMIN_PASSWORD='replace-with-a-strong-password'
docker compose up --build
```

## Data and money model

Runtime data is written to `data/giffcash.json` and excluded from Git. Monetary values are stored as integer pesewas to avoid floating-point rounding errors.

The JSON store is suitable for an MVP and local demonstrations. Before handling real financial data, migrate persistence to PostgreSQL, introduce an immutable double-entry ledger, external secrets management, encrypted backups, stronger tenant isolation, monitoring, penetration testing, and institution-specific compliance controls.

## API summary

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET|POST /api/customers`
- `GET|POST /api/loans`
- `POST /api/loans/:id/submit`
- `POST /api/loans/:id/approve`
- `POST /api/loans/:id/decline`
- `POST /api/loans/:id/disburse`
- `POST /api/loans/:id/repay`
- `GET /api/audit`
- `GET /api/health`

See [the roadmap](docs/ROADMAP.md) for the next implementation phases.
