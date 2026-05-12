# FreshFridge 🥬

A smart food expiry tracker. Photograph a food label and AI automatically extracts the product name, expiry date, ingredients, allergens, and nutrition facts. Allergen warnings fire instantly if a scanned item matches your personal allergen profile.

**Live app:** https://fresh-fridge-nu.vercel.app  
**Team:** Pimnapat Koovuthyakorn · Phodcharaphon Ninkhong · Thawin Tengamnuay

---

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173

---

## Running the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at http://localhost:8000

---

## Environment Variables

**frontend/.env**
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

**backend/.env**
```env
TYPHOON_API_KEY=your_typhoon_api_key
TYPHOON_BASE_URL=https://api.opentyphoon.ai/v1
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
