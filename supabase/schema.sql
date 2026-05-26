create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('member', 'coach_admin')) default 'member',
  full_name text not null,
  email text not null,
  instagram_handle text,
  avatar_url text,
  joined_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.profiles(user_id) on delete set null,
  title text not null,
  summary text not null default '',
  cadence text not null default '',
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plan_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(user_id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  status text not null check (status in ('active', 'archived')) default 'active',
  starts_on date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.profiles(user_id) on delete set null,
  title text not null,
  description text not null default '',
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  bucket text not null default 'member-documents',
  path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_access (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  member_id uuid not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (document_id, member_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(user_id) on delete cascade,
  coach_id uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(user_id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.billing_accounts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.profiles(user_id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  plan_name text not null default 'Twigthetics Online Coaching',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.is_coach_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid() and role = 'coach_admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.plan_assignments enable row level security;
alter table public.documents enable row level security;
alter table public.document_access enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.billing_accounts enable row level security;

create policy "members read own profile"
on public.profiles
for select
using (auth.uid() = user_id or public.is_coach_admin());

create policy "admin manages profiles"
on public.profiles
for all
using (public.is_coach_admin())
with check (public.is_coach_admin());

create policy "members read assigned plans"
on public.plan_assignments
for select
using (member_id = auth.uid() or public.is_coach_admin());

create policy "admin manages plan assignments"
on public.plan_assignments
for all
using (public.is_coach_admin())
with check (public.is_coach_admin());

create policy "members read plans through assignments"
on public.plans
for select
using (
  public.is_coach_admin()
  or exists (
    select 1
    from public.plan_assignments
    where plan_assignments.plan_id = plans.id
      and plan_assignments.member_id = auth.uid()
  )
);

create policy "admin manages plans"
on public.plans
for all
using (public.is_coach_admin())
with check (public.is_coach_admin());

create policy "members read assigned document access"
on public.document_access
for select
using (member_id = auth.uid() or public.is_coach_admin());

create policy "admin manages document access"
on public.document_access
for all
using (public.is_coach_admin())
with check (public.is_coach_admin());

create policy "members read assigned documents"
on public.documents
for select
using (
  public.is_coach_admin()
  or exists (
    select 1
    from public.document_access
    where document_access.document_id = documents.id
      and document_access.member_id = auth.uid()
  )
);

create policy "admin manages documents"
on public.documents
for all
using (public.is_coach_admin())
with check (public.is_coach_admin());

create policy "members read own conversation"
on public.conversations
for select
using (member_id = auth.uid() or public.is_coach_admin());

create policy "members create own conversation"
on public.conversations
for insert
with check (member_id = auth.uid() or public.is_coach_admin());

create policy "admin updates conversations"
on public.conversations
for update
using (public.is_coach_admin())
with check (public.is_coach_admin());

create policy "members read own messages"
on public.messages
for select
using (
  public.is_coach_admin()
  or exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
      and conversations.member_id = auth.uid()
  )
);

create policy "members send own messages"
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and (
    public.is_coach_admin()
    or exists (
      select 1
      from public.conversations
      where conversations.id = messages.conversation_id
        and conversations.member_id = auth.uid()
    )
  )
);

create policy "members read own billing"
on public.billing_accounts
for select
using (member_id = auth.uid() or public.is_coach_admin());

create policy "admin manages billing"
on public.billing_accounts
for all
using (public.is_coach_admin())
with check (public.is_coach_admin());
