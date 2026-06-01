# Badminton Club Management System (BMS)

An ERP-style web platform for managing the daily operations of a badminton facility.
Three-tier application: **React (Vite) client · Node.js/Express server · PostgreSQL database**.

## Modules

| Module | Description |
|--------|-------------|
| Court Booking | Reserve courts, apply tier discounts, earn reward points |
| Equipment Rental | Rent rackets & shoes, track condition, collect damage fees |
| Restringing Service | Manage stringing work orders, charge materials & labour |
| Pro-Shop POS | Sell goods, redeem reward points as payment |
| Coaching Session | Book coaching slots, apply member tier discounts |
| Data Management | CRUD for members, courts, assets, products, coaches |
| Sales History | Transaction log + points analysis report |

## Tech Stack

- **client** — React 19, Vite, Tailwind CSS, React Router
- **server** — Node.js, Express, `pg` (PostgreSQL driver), Zod, Winston
- **database** — PostgreSQL 17 (Docker)

## Requirements

- Node.js 20+
- Docker (for the PostgreSQL database)

## Quick Start (local dev)

### 1. Database (Docker)
```bash
npm run db:start          # starts postgres on port 15433, auto-runs schema + seed
```

### 2. Server
```bash
cd server
cp .env.example .env
npm install
npm run dev               # http://localhost:4000
```

### 3. Client
```bash
cd client
cp .env.example .env.local
npm install
npm run dev               # http://localhost:5173
```

### One command (from repo root)
```bash
npm run dev               # starts DB + installs + runs server & client together
```

## Run Everything in Docker
```bash
npm run docker:up         # builds + runs database, server, client
# client → http://localhost:3000  ·  server → http://localhost:4000
npm run docker:down
```

## Environment Variables

**server/.env**
```
PORT=4000
HOST=0.0.0.0
DATABASE_URL=postgresql://root:root@localhost:15433/bms_db
```

**client/.env.local**
```
VITE_API_BASE=          # empty = use Vite dev proxy to localhost:4000
```

## API Summary

All endpoints under `/api`. Response shape: `{ success, data, error, meta? }`.

| Resource | Endpoints |
|----------|-----------|
| `/api/members` | list, get, create, update, delete (search by id/phone/name) |
| `/api/courts` `/api/coaches` `/api/assets` `/api/products` | master-data CRUD |
| `/api/bookings` | court reservations (header + line items) |
| `/api/rentals` | equipment rentals + returns |
| `/api/sessions` | coaching sessions |
| `/api/work-orders` | restringing work orders |
| `/api/receipts` | POS sales (create/get/delete) |
| `/api/sales` | sales list + `/points` analytics |

See `PROJECT_STRUCTURE.md` for the full layout.
