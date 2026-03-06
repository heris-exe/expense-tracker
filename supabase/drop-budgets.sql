-- Optional: run in Supabase SQL Editor if you already have the budgets table
-- and want to remove it after removing the budget feature from the app.
-- New setups can ignore this; schema.sql no longer creates budgets.

drop table if exists public.budgets;
drop type if exists public.budget_scope;
drop type if exists public.budget_period_type;
