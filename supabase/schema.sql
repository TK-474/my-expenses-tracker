-- Ledger schema. Run this once in the Supabase SQL Editor
-- (dashboard -> SQL Editor -> New query -> paste -> Run).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  color text,
  budget numeric(12, 2) check (budget is null or budget > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  description text not null,
  category text not null,
  date date not null,
  payment_method text check (payment_method in ('cash', 'card', 'digital', 'other')),
  bank text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_user_date_idx on public.expenses (user_id, date desc);
create index categories_user_idx on public.categories (user_id);

-- Row Level Security: each user can only touch their own rows
alter table public.categories enable row level security;
alter table public.expenses enable row level security;

create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep updated_at fresh on every update
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create trigger expenses_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();
