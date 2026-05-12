# FreshFridge — Frontend

React + Vite + Tailwind CSS frontend for FreshFridge, a food expiry tracker with OCR label scanning.

## Features

- **OCR Label Scanning** — photograph a food label; Typhoon OCR + LLM extracts the product name and expiry date automatically
- **Fridge Tracker** — full CRUD list of your fridge items with colour-coded expiry badges
- **Dashboard** — summary cards and a pie chart showing safe / expiring soon / urgent items
- **Auth** — email/password sign-up and login via Supabase
- **Dark Mode** — pastel green light theme + dark slate theme, toggled per device

## Tech Stack

| Layer | Choice |
|---|---|
| UI framework | React 18 + Vite |
| Styling | Tailwind CSS v3 (custom `fresh-*` pastel palette) |
| Auth & DB | Supabase (email/password auth + PostgreSQL) |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=https://<your-backend-url>
```

### 3. Create the Supabase table

Run this in the Supabase SQL editor:

```sql
create table fridge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  expiry_date date not null,
  created_at timestamptz default now()
);

-- Row-level security: users only see their own items
alter table fridge_items enable row level security;

create policy "Users manage own items" on fridge_items
  for all using (auth.uid() = user_id);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── lib/
│   ├── supabaseClient.js   Supabase client initialisation
│   └── api.js              scanImage(), getItems(), addItem(), deleteItem()
├── components/
│   ├── Navbar.jsx
│   ├── ItemCard.jsx
│   ├── ExpiryBadge.jsx     Red / amber / green pill based on days remaining
│   ├── ThemeToggle.jsx
│   └── Spinner.jsx
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx
    ├── ScannerPage.jsx
    └── ItemsPage.jsx
```

## Deployment

Deploy to **Vercel** in one step:

```bash
npm run build   # verify build passes locally first
```

Then connect the GitHub repo to Vercel and set the three environment variables in the Vercel project settings. The build command is `npm run build` and the output directory is `dist`.

## Backend

The FastAPI backend (receives image uploads, calls Typhoon OCR/LLM) lives in `../backend/`. See its own README for setup.
