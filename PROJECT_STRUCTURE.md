# Project Structure

Three-tier Badminton Club Management System.
Stack: React (Vite) client, Node.js/Express server, PostgreSQL.

## `client/`
Frontend (React 19, Vite, Tailwind CSS).

- **`src/api/`** — API client layer.
  - `http.js`: shared `fetch` wrapper, reads `VITE_API_BASE`, throws on `{success:false}`.
- **`src/lib/api.js`** — `get/post/put/del` helpers (unwrap `{success,data}`).
- **`src/components/`** — Reusable UI (`ui.jsx`: tables, modals, search selects, export/print).
- **`src/contexts/`** — toast context.
- **`src/layouts/`** — sidebar + page shell.
- **`src/pages/`** — page views per module: `booking/`, `rental/`, `restringing/`, `coaching/`, `pos/`, `sales/`, `data/`.

## `server/`
Backend (Express, PostgreSQL via `pg`). Layered architecture.

- **`src/routes/`** — Express route definitions (thin).
- **`src/controllers/`** — request handlers (validate, call service, send response).
- **`src/services/`** — business logic + parameterized SQL queries.
- **`src/db/pool.js`** — PostgreSQL connection pool.
- **`src/utils/`** — `response.js` (consistent `{success,data,error,meta}`), `logger.js` (Winston).
- **`src/app.js`** — Express app, middleware, route mounting.

## `database/`
PostgreSQL schema + seed.

- **`init/`** — `01_schema.sql`, `02_seed.sql` (auto-run on first container start).
- **`sql/`** — `001_schema.sql`, `003_seed.sql`, `sql_run.sql` (full reset).
- **`compose.yaml`** — database-only Docker Compose.
- **`setup_db.js`** — start / reset helper.

## Root
- **`docker-compose.yml`** — full stack (database + server + client).
- **`package.json`** — dev scripts (`db:start`, `dev`, `docker:up`).
- **`README.md`** / **`PROJECT_STRUCTURE.md`** — docs.

## Key Features

- **Auto-numbering**: Reservations `RV…`, Rentals `RI…`, Sessions `CS…`, Work Orders `WO…`, Receipts `PO…`.
- **Header–detail pattern**: each transaction = header + line items, with cascading deletes.
- **Loyalty tiers**: Bronze / Silver / Gold / Premium with discounts + point multipliers.
- **Reports**: sales transactions + points-redeemed-by-month analytics.
- **Security**: parameterized SQL only (no string concatenation).
