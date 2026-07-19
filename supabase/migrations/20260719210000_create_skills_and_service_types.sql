create table public.skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,
  constraint skills_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete restrict,
  constraint skills_updated_by_fkey
    foreign key (updated_by)
    references public.profiles (id)
    on delete restrict,
  constraint skills_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint skills_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint skills_name_format check (
    name = btrim(name)
    and char_length(name) between 2 and 120
  ),
  constraint skills_description_format check (
    description is null
    or (
      description = btrim(description)
      and char_length(description) between 1 and 1000
    )
  )
);

create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_types_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,
  constraint service_types_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete restrict,
  constraint service_types_updated_by_fkey
    foreign key (updated_by)
    references public.profiles (id)
    on delete restrict,
  constraint service_types_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint service_types_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint service_types_name_format check (
    name = btrim(name)
    and char_length(name) between 2 and 120
  ),
  constraint service_types_description_format check (
    description is null
    or (
      description = btrim(description)
      and char_length(description) between 1 and 1000
    )
  )
);

create unique index skills_organization_name_lower_key
  on public.skills (organization_id, lower(name));

create index skills_organization_active_name_idx
  on public.skills (organization_id, active, name);

create unique index service_types_organization_name_lower_key
  on public.service_types (organization_id, lower(name));

create index service_types_organization_active_name_idx
  on public.service_types (organization_id, active, name);

create trigger skills_set_updated_at
before update on public.skills
for each row execute function private.set_updated_at();

create trigger service_types_set_updated_at
before update on public.service_types
for each row execute function private.set_updated_at();

revoke all on public.skills from anon, authenticated;
revoke all on public.service_types from anon, authenticated;

grant select on public.skills to authenticated;
grant insert (
  organization_id,
  name,
  description,
  active,
  created_by,
  updated_by
) on public.skills to authenticated;
grant update (
  name,
  description,
  active,
  updated_by
) on public.skills to authenticated;

grant select on public.service_types to authenticated;
grant insert (
  organization_id,
  name,
  description,
  active,
  created_by,
  updated_by
) on public.service_types to authenticated;
grant update (
  name,
  description,
  active,
  updated_by
) on public.service_types to authenticated;

alter table public.skills enable row level security;
alter table public.service_types enable row level security;

create policy skills_select_administrative
on public.skills
for select
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy skills_select_operational
on public.skills
for select
to authenticated
using (
  active
  and (select private.is_active_organization_member(organization_id))
);

create policy skills_insert_administrative
on public.skills
for insert
to authenticated
with check (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy skills_update_administrative
on public.skills
for update
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
)
with check (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
  and updated_by = (select auth.uid())
);

create policy service_types_select_administrative
on public.service_types
for select
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy service_types_select_operational
on public.service_types
for select
to authenticated
using (
  active
  and (select private.is_active_organization_member(organization_id))
);

create policy service_types_insert_administrative
on public.service_types
for insert
to authenticated
with check (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);

create policy service_types_update_administrative
on public.service_types
for update
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
)
with check (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
  and updated_by = (select auth.uid())
);
