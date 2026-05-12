-- Run this in your Supabase SQL editor

create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  expiry_date date,
  quantity    int not null default 1,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Each user can only see and modify their own items
alter table public.items enable row level security;

create policy "Users can manage their own items"
  on public.items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast per-user queries sorted by expiry
create index if not exists items_user_expiry on public.items(user_id, expiry_date);
