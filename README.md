# Spend NG (React)

A **React** web app to track daily expenses in **₦ (Naira)**. Built with Vite, Tailwind CSS, and shadcn/ui. No Excel — add expenses, see dashboard totals and charts, and filter the log by date. **Data syncs across devices** via Supabase (sign in on each device to see the same expenses).

## Stack

- **React 18** + **Vite** — fast dev and builds
- **Tailwind CSS v4** — layout and utilities
- **shadcn/ui** — Button, Input, Select, Card, Table, etc. (Cursor-style dark theme)
- **Recharts** — spending by category (pie) and by month (bar)
- **Supabase** — auth and database so your expenses sync across phones, tablets, and computers

## What it does

- **Sign in / Sign up** — one account, same data on every device
- **Dashboard**: Today’s total, this month’s total, all-time total
- **Charts**: Spending by category (pie), spending by month (bar)
- **Add expense**: Date, category, description, amount (₦), payment method, notes. Edit via the table
- **Daily log**: Table with date filter; Edit and Delete per row

## Prerequisites

- **Node.js** v18+
- **npm**

## Run locally

```bash
cd expense-tracker
npm install
npm run dev
```

Open **http://localhost:5173**.  
If Supabase isn’t configured yet, the app will show setup instructions.

## Cloud sync (Supabase)

To use the app on multiple devices with the same data:

1. Create a free project at [app.supabase.com](https://app.supabase.com).
2. In the project: **Settings → API** — copy **Project URL** and **anon public** key.
3. In this repo, copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` = Project URL  
   - `VITE_SUPABASE_ANON_KEY` = anon public key
4. In Supabase: **SQL Editor** — run the script in `supabase/schema.sql` to create the `expenses` table and Row Level Security (so each user only sees their own data).
5. Restart the dev server (`npm run dev`) and reload the app. Sign up with email/password; your expenses will sync across any device where you sign in.

## Build for production

```bash
npm run build
```

Deploy the **dist/** folder to any static host (Netlify, Vercel, GitHub Pages).  
Set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host’s environment so auth and data work in production.

**Google sign-in in production:** To avoid redirecting to localhost after sign-in, set `VITE_APP_URL` to your live URL (e.g. `https://your-app.vercel.app`) in the host's environment. In Supabase: **Authentication → URL Configuration** set **Site URL** to that same URL and add it to **Redirect URLs**.

Preview locally: `npm run preview`

## Project structure

```
expense-tracker/
  index.html
  package.json
  vite.config.js
  components.json          # shadcn CLI config
  jsconfig.json            # path alias @/
  supabase/
    schema.sql             # run in Supabase SQL Editor to create expenses table
  scripts/
    exportSeedFromExcel.js # one-off: Excel → src/data/seedExpenses.json
  src/
    main.jsx
    App.jsx
    contexts/
      AuthContext.jsx      # Supabase auth state and sign in/up/out
    services/
      expenseApi.js        # Supabase CRUD for expenses
    lib/
      supabase.js          # Supabase client (reads .env)
    index.css               # Tailwind + Cursor theme (@theme inline)
    constants.js
    lib/
      utils.js              # cn() for class names
    utils/
      helpers.js
    data/
      seedExpenses.json     # prepopulate from Excel
    components/
      Dashboard.jsx
      ExpenseCharts.jsx
      ExpenseForm.jsx
      ExpenseLog.jsx
      ui/                   # shadcn (button, input, card, select, table, separator)
  README.md
```

## Customize

- **Categories**: `src/constants.js` → `CATEGORIES`
- **Payment methods**: `src/constants.js` → `PAYMENT_METHODS`
- **Theme**: Cursor-style (black/grey/white) in `src/index.css` → `@theme inline`
- **More shadcn components**: `npx shadcn@latest add dialog` (etc.)
