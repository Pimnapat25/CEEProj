# FreshFridge — Backend

## Features

- **OCR Scan Endpoint** — receives a food label image, calls Typhoon OCR then Typhoon LLM, returns name, expiry date, ingredients, allergens, and nutrition facts
- **Fridge Items CRUD** — create, read, and delete fridge items scoped per user via Supabase RLS
- **JWT Auth** — verifies Supabase JWT on every protected route via the Authorization header

## Folder Structure

```
backend/
├── main.py
├── config.py
├── dependencies.py
├── requirements.txt
├── supabase_schema.sql
├── routers/
│   ├── auth.py
│   ├── items.py
│   └── scan.py
└── services/
    ├── supabase_client.py
    └── typhoon.py
```

## Running

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
