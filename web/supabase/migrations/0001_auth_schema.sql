-- crucru-auth schema: users, linked social accounts, refresh tokens.
-- Apply via Supabase SQL editor or `supabase db push`.

create extension if not exists "pgcrypto";

-- ============ users ============
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============ social_accounts ============
-- One row per (provider, provider_user_id). A user may link several providers.
create table if not exists public.social_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  provider         text not null check (provider in ('google', 'kakao', 'naver', 'apple')),
  provider_user_id text not null,
  email            text,
  created_at       timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create index if not exists idx_social_accounts_user_id
  on public.social_accounts (user_id);

-- ============ refresh_tokens ============
-- Stores only the sha256 hash of the token's jti for single-use rotation.
create table if not exists public.refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  jti_hash    text not null unique,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_user_id
  on public.refresh_tokens (user_id);

-- keep updated_at fresh on users
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ============ Row Level Security ============
-- The backend uses the service role key (bypasses RLS). Enabling RLS with no
-- permissive policies keeps these tables locked to anon/auth client keys.
alter table public.users          enable row level security;
alter table public.social_accounts enable row level security;
alter table public.refresh_tokens  enable row level security;
