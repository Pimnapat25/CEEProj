# FreshFridge — Frontend

## Features

- **OCR Label Scanning** — photograph a food label to extract name, expiry date, ingredients, allergens, and nutrition facts
- **Allergen Alerts** — set your allergen profile; get a warning instantly when a scanned label contains a match
- **Fridge Tracker** — add, view, and delete fridge items with colour-coded expiry badges
- **Dashboard** — summary cards and a pie chart showing expiry status across your fridge
- **Dark Mode** — pastel green light theme and dark slate theme, persisted across sessions

## Folder Structure

```
src/
├── lib/
│   ├── supabaseClient.js
│   └── api.js
├── components/
│   ├── Navbar.jsx
│   ├── ItemCard.jsx
│   ├── ExpiryBadge.jsx
│   ├── AllergyAlert.jsx
│   ├── ThemeToggle.jsx
│   └── Spinner.jsx
└── pages/
    ├── LoginPage.jsx
    ├── DashboardPage.jsx
    ├── ScannerPage.jsx
    └── ItemsPage.jsx
```

## Running

```bash
npm install
npm run dev
```
