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

- **Frontend** — React (Vite), Tailwind CSS
- **Backend** — Node.js, Express
- **Database** — Supabase (PostgreSQL)

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_ANON_KEY
npm install
npm run dev            # runs on port 4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # runs on port 5173
```

## Environment Variables

**backend/.env**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PORT=4000
```

**frontend/.env.local**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
