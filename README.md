# FreshFridge 🥬

A smart food expiry tracker. Photograph a food label and AI automatically extracts the product name, expiry date, ingredients, allergens, and nutrition facts. Allergen warnings fire instantly if a scanned item matches your personal allergen profile.

**Live app:** https://fresh-fridge-nu.vercel.app  
**Team:** Pimnapat Koovuthyakorn · Phodcharaphon Ninkhong · Thawin Tengamnuay

---

## Repository Structure

```
CEEProj/
├── frontend/   React + Vite + Tailwind (deployed to Vercel)
└── backend/    Python + FastAPI (deployed to Railway)
```

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) project
- A [Typhoon API](https://opentyphoon.ai) key

---

## 1 — Database Setup (Supabase)

Go to **Supabase → SQL Editor** and run `backend/supabase_schema.sql`:

```sql
create table if not exists public.fridge_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  expiry_date date,
  quantity    int not null default 1,
  ingredients text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.fridge_items enable row level security;

create policy "Users can manage their own items"
  on public.fridge_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Then go to **Authentication → Providers → Email** and disable **"Confirm email"** so users can register without email verification.

---

## 2 — Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
TYPHOON_API_KEY=your_typhoon_api_key
TYPHOON_BASE_URL=https://api.opentyphoon.ai/v1
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> Use the **service role key** (not the anon key) — found in Supabase → Settings → API → `service_role secret`.

Run the server:

```bash
uvicorn main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

---

## 3 — Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

> Use the **anon key** here — found in Supabase → Settings → API → `anon public`.

Run the dev server:

```bash
npm run dev
# App available at http://localhost:5173
```

---

## 4 — Deployment

### Frontend → Vercel

1. Push the `frontend` branch to GitHub
2. Import the repo in [Vercel](https://vercel.com), set **Root Directory** to `frontend`
3. Add the three environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` pointing to your Railway URL)
4. Deploy — Vercel auto-redeploys on every push

### Backend → Railway

1. Push the `backend` branch to GitHub
2. Create a new project in [Railway](https://railway.app), connect the repo, set root to `backend`
3. Add environment variables (`TYPHOON_API_KEY`, `TYPHOON_BASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
4. Railway auto-detects `requirements.txt` and runs `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/scan` | Upload image, returns name, expiry date, allergens, nutrition |
| `GET` | `/items` | List fridge items for the authenticated user |
| `POST` | `/items` | Add a fridge item |
| `DELETE` | `/items/{id}` | Delete a fridge item |

All `/items` and `/scan` endpoints require `Authorization: Bearer <supabase_jwt>` header.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Recharts, Lucide React |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| AI / OCR | Typhoon OCR API + Typhoon LLM API |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |
