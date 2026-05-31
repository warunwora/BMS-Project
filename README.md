# Badminton Club Management System

An ERP-style web platform for managing the daily operations of a badminton facility.

## Modules

| Module | Description |
|--------|-------------|
| Court Booking | Reserve courts, apply tier discounts, earn reward points |
| Equipment Rental | Rent rackets & shoes, track condition, collect damage fees |
| Restringing Service | Manage stringing work orders, charge materials & labour |
| Pro-Shop POS | Sell goods, redeem reward points as payment |
| Coaching Session | Book coaching slots, apply member tier discounts |
| Member Loyalty | Bronze / Silver / Gold tiers with point multipliers |

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS
- **Backend** — Node.js, Express
- **Database** — Supabase (PostgreSQL)

## Requirements

- Node.js 18 or higher
- npm

## Quick Start

### 1. Clone

```bash
git clone https://github.com/warunwora/BMS-Project.git
cd BMS-Project
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=4000
```

```bash
npm install
npm run dev
```

Backend runs on **http://localhost:4000**

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

## Project Structure

```
BMS-Project/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server entry
│   │   ├── lib/supabase.js   # Supabase client
│   │   └── routes/           # API routes
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Shared UI components
    │   ├── contexts/         # React context
    │   ├── layouts/          # Page layout
    │   ├── lib/              # API helpers
    │   └── pages/            # Page components
    ├── .env.example
    ├── vite.config.js
    └── package.json
```
