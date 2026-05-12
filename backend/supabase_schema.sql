-- Run this in your Supabase SQL editor

create table if not exists public.fridge_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  expiry_date date,
  quantity    int not null default 1,
  ingredients text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- If the table already exists without these columns, add them:
alter table public.fridge_items add column if not exists ingredients text;
alter table public.fridge_items add column if not exists notes text;
alter table public.fridge_items add column if not exists quantity int not null default 1;

-- Row Level Security: each user only sees their own rows
alter table public.fridge_items enable row level security;

drop policy if exists "Users can manage their own items" on public.fridge_items;
create policy "Users can manage their own items"
  on public.fridge_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists fridge_items_user_expiry on public.fridge_items(user_id, expiry_date);
