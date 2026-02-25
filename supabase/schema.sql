-- Run this in Supabase: SQL Editor → New query → paste and run.
-- This creates the expenses & budgets tables and Row Level Security so each user only sees their own data.

-- Table: one row per expense, linked to the signed-in user
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  category text not null,
  description text not null,
  amount text not null,
  payment_method text,
  notes text,
  created_at timestamptz default now()
);

-- Index for fast "my expenses" queries
create index if not exists expenses_user_id_idx on public.expenses (user_id);

-- Row Level Security: users can only read/insert/update/delete their own rows
alter table public.expenses enable row level security;

create policy "Users can read own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Budgets: configurable daily, weekly, and monthly limits per user
-- ---------------------------------------------------------------------------

-- Enum types for strong constraints at the database level
do $$
begin
  if not exists (select 1 from pg_type where typname = 'budget_scope') then
    create type public.budget_scope as enum ('overall', 'category');
  end if;

  if not exists (select 1 from pg_type where typname = 'budget_period_type') then
    create type public.budget_period_type as enum ('day', 'week', 'month');
  end if;
end
$$;

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scope public.budget_scope not null,
  category text,
  period_type public.budget_period_type not null,
  -- Canonical anchor for the period:
  -- - day: exact date (YYYY-MM-DD)
  -- - week: Monday of the ISO week (YYYY-MM-DD)
  -- - month: first day of the month (YYYY-MM-DD)
  period_start text not null,
  amount numeric not null,
  created_at timestamptz default now()
);

-- Index for fast "my budgets" queries by current period
create index if not exists budgets_user_period_idx
  on public.budgets (user_id, period_type, period_start);

-- Prevent duplicate logical budgets for the same user/scope/category/period
create unique index if not exists budgets_user_scope_period_unique
  on public.budgets (user_id, scope, coalesce(category, ''), period_type, period_start);

-- Row Level Security: users can only read/insert/update/delete their own budgets
alter table public.budgets enable row level security;

create policy "Users can read own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);
