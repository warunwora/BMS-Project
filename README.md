# Badminton Club Management System (BMS)

An ERP-style web platform for managing the daily operations of a badminton facility.  
Three-tier application: **React (Vite) client · Node.js/Express server · Supabase PostgreSQL**.

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

## Membership Tiers

| Tier | Discount | Points Multiplier |
|------|----------|-------------------|
| Bronze | 5% | ×1.05 |
| Silver | 7% | ×1.10 |
| Gold | 10% | ×1.70 |

## Tech Stack

- **client** — React, Vite, Tailwind CSS, React Router
- **server** — Node.js, Express, `pg` (PostgreSQL driver)
- **database** — Supabase (PostgreSQL)

## Requirements

- Node.js 20+
- Docker (optional — for running client/server containers)
- A [Supabase](https://supabase.com) project with the schema set up

## Quick Start

### 1. Clone
```bash
git clone https://github.com/warunwora/BMS-Project.git
cd BMS-Project
```

### 2. Server setup
```bash
cd server
cp .env.example .env
```

Edit `server/.env` — fill in your Supabase connection string:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```
> Get this from: **Supabase Dashboard → Connect → Direct connection**

```bash
npm install
npm run dev        # → http://localhost:4000
```

### 3. Client setup
```bash
cd client
cp .env.example .env.local
npm install
npm run dev        # → http://localhost:5173
```

### One command (from repo root)
```bash
npm install
npm run dev        # installs + starts server & client together
```

### Run with Docker
```bash
# Create server/.env first with your DATABASE_URL, then:
npm run docker:up        # → client: http://localhost:3000 · server: http://localhost:4000
npm run docker:down
```

## Database

This project uses **Supabase** as the database.  
To use your own Supabase project:
1. Create a project at [supabase.com](https://supabase.com)
2. Run `database/sql/001_schema.sql` in the Supabase SQL Editor to create tables
3. Optionally run `database/sql/003_seed.sql` for sample data
4. Copy the connection string into `server/.env`

## Environment Variables

**server/.env**
```
PORT=4000
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**client/.env.local**
```
VITE_API_BASE=    # leave empty — Vite proxy handles /api → localhost:4000
```

## API

All endpoints under `/api`. Response: `{ success, data, error, meta? }`

| Resource | Methods |
|----------|---------|
| `/api/members` | GET, POST, PUT/:id, DELETE/:id |
| `/api/courts` `/api/coaches` `/api/assets` `/api/products` | CRUD |
| `/api/bookings` | Court reservations + line items |
| `/api/rentals` | Equipment rentals + returns |
| `/api/sessions` | Coaching sessions |
| `/api/work-orders` | Restringing orders |
| `/api/receipts` | POS sales |
| `/api/sales` | Sales list + `/points` analytics |
