# FreshFridge — Project Summary

---

## App Name
**FreshFridge** 🥬

## What It Does
FreshFridge is a smart food expiry tracker that helps users reduce food waste by keeping track of items in their fridge. Users photograph a food product label and the app uses OCR + AI to automatically extract the product name, expiry date, ingredients, allergens, and nutrition facts. If a scanned item contains an ingredient the user is allergic to, the app immediately shows a warning alert.

---

## Features Built

| Feature | Description |
|---|---|
| **OCR Label Scanning** | Upload or photograph a food label — Typhoon OCR + LLM extracts name, expiry date, ingredients, allergens, and nutrition facts |
| **Fridge Item Tracker** | Full CRUD list of fridge items with colour-coded expiry badges (red / amber / green) and expandable ingredient details |
| **Allergen Alert System** | Users set their allergen profile (common presets + custom); a red warning banner appears instantly when a scanned label contains a matched allergen |
| **Dashboard & Charts** | Summary cards (total items, expiring ≤3 days, ≤7 days) and a Recharts pie chart showing expiry status across the fridge |
| **User Authentication** | Email/password sign-up and login via Supabase Auth with JWT session management |
| **Dark Mode** | Full light/dark theme toggle (pastel green + white / slate dark), persisted across sessions |

---

## Optional Challenging Tier

| Tier | Requirement | Implementation |
|---|---|---|
| ⭐ **S — Computer Vision** (20 pts) | Image input processed by AI | Food label photo → Typhoon OCR → Typhoon LLM → structured data |
| 🥈 **B — Saved / Favorites** (12 pts) | Persistent user data | Fridge items stored in Supabase PostgreSQL, scoped per user via RLS |
| 🥈 **B — Dashboard & Visualization** (12 pts) | Charts and data summary | Recharts PieChart + 3 summary stat cards on dashboard |
| 🥉 **C — Dark Mode** (4 pts) | Theme toggle | Tailwind `dark:` class system, toggle in navbar, saved to localStorage |

---

## Live URL
> _Add Vercel deployment URL here after deploying_

---

## GitHub URL
**https://github.com/Pimnapat25/CEEProj**
- Frontend branch: `frontend`
- Backend branch: `backend`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Backend | Python, FastAPI |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| AI / OCR | Typhoon OCR API + Typhoon LLM API |
| Charts | Recharts |
| Icons | Lucide React |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway |

---

## Team Members

| Name |
|---|
| Pimnapat Koovuthyakorn |
