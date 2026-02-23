# Expense Tracker 2026 (React)

A **React** web app to track daily expenses in **₦ (Naira)**. Built with Vite, Tailwind CSS, and shadcn/ui. No Excel — add expenses, see dashboard totals and charts, and filter the log by date. Data is stored in your browser (localStorage).

## Stack

- **React 18** + **Vite** — fast dev and builds
- **Tailwind CSS v4** — layout and utilities
- **shadcn/ui** — Button, Input, Select, Card, Table, etc. (Cursor-style dark theme)
- **Recharts** — spending by category (pie) and by month (bar)
- **localStorage** — persistence (key: `expense-tracker-2026`)

## What it does

- **Dashboard**: Today’s total, this month’s total, all-time total
- **Charts**: Spending by category (pie), spending by month (bar)
- **Add expense**: Date, category, description, amount (₦), payment method, notes. Edit via the table
- **Daily log**: Table with date filter; Edit and Delete per row
- **Seed data**: Prepopulates from Excel export when localStorage is empty (see `scripts/exportSeedFromExcel.js`)

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

## Build for production

```bash
npm run build
```

Deploy the **dist/** folder to any static host (Netlify, Vercel, GitHub Pages).

Preview locally: `npm run preview`

## Project structure

```
expense-tracker/
  index.html
  package.json
  vite.config.js
  components.json          # shadcn CLI config
  jsconfig.json            # path alias @/
  scripts/
    exportSeedFromExcel.js # one-off: Excel → src/data/seedExpenses.json
  src/
    main.jsx
    App.jsx
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
