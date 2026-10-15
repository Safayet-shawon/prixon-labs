-- Praxivon Labs — initial schema for Supabase (Postgres).
-- Run in the Supabase SQL editor, or with `supabase db push`.

create table if not exists public.services (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null check (char_length(title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 1000),
  category    text not null check (char_length(category) between 1 and 120),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.projects (
  slug         text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null check (char_length(name) between 1 and 160),
  type         text not null check (char_length(type) between 1 and 160),
  year         text not null check (char_length(year) between 1 and 20),
  summary      text not null check (char_length(summary) <= 1000),
  intro        text not null check (char_length(intro) <= 2000),
  challenge    text not null check (char_length(challenge) <= 4000),
  approach     text not null check (char_length(approach) <= 4000),
  outcome      text not null check (char_length(outcome) <= 4000),
  -- Disciplines joined with '|' so the optional Spring Boot API can share this table.
  scope        text not null check (char_length(scope) >= 1),
  visual_theme text not null check (char_length(visual_theme) <= 80),
  visual_note  text not null check (char_length(visual_note) <= 500),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 100),
  email      text check (email is null or char_length(email) <= 254),
  phone      text check (phone is null or char_length(phone) <= 40),
  company    text check (company is null or char_length(company) <= 100),
  service    text not null check (char_length(service) <= 100),
  message    text not null check (char_length(message) between 10 and 5000),
  status     text not null default 'new' check (status in ('new', 'contacted', 'closed', 'spam')),
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

-- Indexes for the access patterns the API actually uses.
create index if not exists services_sort_idx    on public.services (sort_order, id);
create index if not exists services_category_idx on public.services (category);
create index if not exists projects_sort_idx    on public.projects (sort_order, slug);
create index if not exists projects_search_idx  on public.projects
  using gin (to_tsvector('english', name || ' ' || type || ' ' || summary || ' ' || intro));
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_new_idx     on public.enquiries (created_at desc) where status = 'new';

-- Keep updated_at honest.
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists services_touch on public.services;
create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- Row level security: the public may read the catalog; nobody but the server
-- (service-role key, which bypasses RLS) may write it or read enquiries.
alter table public.services  enable row level security;
alter table public.projects  enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "catalog is public: services" on public.services;
create policy "catalog is public: services" on public.services for select to anon, authenticated using (true);
drop policy if exists "catalog is public: projects" on public.projects;
create policy "catalog is public: projects" on public.projects for select to anon, authenticated using (true);

revoke all on public.enquiries from anon, authenticated;
revoke insert, update, delete on public.services, public.projects from anon, authenticated;
