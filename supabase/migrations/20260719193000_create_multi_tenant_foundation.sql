create schema if not exists private;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create type public.organization_role as enum (
  'admin',
  'coordinator',
  'technician'
);

create type public.organization_member_status as enum (
  'invited',
  'active',
  'blocked'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  tax_id text,
  slug text not null,
  timezone text not null default 'America/Sao_Paulo',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_not_blank check (btrim(name) <> ''),
  constraint organizations_legal_name_not_blank check (
    legal_name is null or btrim(legal_name) <> ''
  ),
  constraint organizations_tax_id_not_blank check (
    tax_id is null or btrim(tax_id) <> ''
  ),
  constraint organizations_slug_format check (
    char_length(slug) <= 63
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint organizations_slug_key unique (slug),
  constraint organizations_timezone_not_blank check (btrim(timezone) <> '')
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_not_blank check (name is null or btrim(name) <> ''),
  constraint profiles_email_not_blank check (email is null or btrim(email) <> ''),
  constraint profiles_phone_not_blank check (phone is null or btrim(phone) <> '')
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.organization_role not null,
  status public.organization_member_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_members_organization_profile_key unique (
    organization_id,
    profile_id
  )
);

create index organization_members_profile_status_idx
  on public.organization_members (profile_id, status);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger organization_members_set_updated_at
before update on public.organization_members
for each row execute function private.set_updated_at();

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    new.email,
    nullif(btrim(new.phone), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function private.handle_new_auth_user();

insert into public.profiles (id, name, email, phone)
select
  users.id,
  nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
  users.email,
  nullif(btrim(users.phone), '')
from auth.users as users
on conflict (id) do nothing;

create function private.is_active_organization_member(
  target_organization_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as membership
    inner join public.organizations as organization
      on organization.id = membership.organization_id
    inner join public.profiles as profile
      on profile.id = membership.profile_id
    where membership.organization_id = target_organization_id
      and membership.profile_id = (select auth.uid())
      and membership.status = 'active'::public.organization_member_status
      and organization.active
      and profile.active
  );
$$;

create function private.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.organization_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members as membership
    inner join public.organizations as organization
      on organization.id = membership.organization_id
    inner join public.profiles as profile
      on profile.id = membership.profile_id
    where membership.organization_id = target_organization_id
      and membership.profile_id = (select auth.uid())
      and membership.status = 'active'::public.organization_member_status
      and membership.role = any(allowed_roles)
      and organization.active
      and profile.active
  );
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
revoke all on function private.is_active_organization_member(uuid)
  from public, anon, authenticated;
revoke all on function private.has_organization_role(uuid, public.organization_role[])
  from public, anon, authenticated;

grant execute on function private.is_active_organization_member(uuid)
  to authenticated;
grant execute on function private.has_organization_role(uuid, public.organization_role[])
  to authenticated;

revoke all on public.organizations from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
revoke all on public.organization_members from anon, authenticated;

grant select on public.organizations to authenticated;
grant select on public.profiles to authenticated;
grant select on public.organization_members to authenticated;
grant usage on type public.organization_role to authenticated;
grant usage on type public.organization_member_status to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;

create policy organizations_select_active_members
on public.organizations
for select
to authenticated
using ((select private.is_active_organization_member(id)));

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy organization_members_select_own
on public.organization_members
for select
to authenticated
using (profile_id = (select auth.uid()));
