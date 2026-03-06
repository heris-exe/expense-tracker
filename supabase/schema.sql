-- Run this in Supabase: SQL Editor → New query → paste and run.
-- This creates the expenses table and Row Level Security so each user only sees their own data.

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
