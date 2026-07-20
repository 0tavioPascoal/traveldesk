create extension if not exists btree_gist with schema extensions;

set search_path = public, extensions;

create table public.technician_unavailability_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technician_unavailability_types_organization_fkey
    foreign key (organization_id) references public.organizations (id) on delete restrict,
  constraint technician_unavailability_types_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint technician_unavailability_types_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint technician_unavailability_types_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technician_unavailability_types_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technician_unavailability_types_organization_id_id_key
    unique (organization_id, id),
  constraint technician_unavailability_types_name_format check (
    name = btrim(name) and char_length(name) between 2 and 120
  ),
  constraint technician_unavailability_types_description_format check (
    description is null or (
      description = btrim(description) and char_length(description) between 1 and 1000
    )
  )
);

create table public.vehicle_unavailability_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_unavailability_types_organization_fkey
    foreign key (organization_id) references public.organizations (id) on delete restrict,
  constraint vehicle_unavailability_types_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint vehicle_unavailability_types_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint vehicle_unavailability_types_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint vehicle_unavailability_types_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint vehicle_unavailability_types_organization_id_id_key
    unique (organization_id, id),
  constraint vehicle_unavailability_types_name_format check (
    name = btrim(name) and char_length(name) between 2 and 120
  ),
  constraint vehicle_unavailability_types_description_format check (
    description is null or (
      description = btrim(description) and char_length(description) between 1 and 1000
    )
  )
);

create unique index technician_unavailability_types_organization_name_lower_key
  on public.technician_unavailability_types (organization_id, lower(name));
create index technician_unavailability_types_organization_active_name_idx
  on public.technician_unavailability_types (organization_id, active, name);
create unique index vehicle_unavailability_types_organization_name_lower_key
  on public.vehicle_unavailability_types (organization_id, lower(name));
create index vehicle_unavailability_types_organization_active_name_idx
  on public.vehicle_unavailability_types (organization_id, active, name);

create table public.technician_unavailabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  technician_id uuid not null,
  unavailability_type_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  reason text,
  notes text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technician_unavailabilities_organization_fkey
    foreign key (organization_id) references public.organizations (id) on delete restrict,
  constraint technician_unavailabilities_technician_fkey
    foreign key (organization_id, technician_id)
    references public.technicians (organization_id, id) on delete restrict,
  constraint technician_unavailabilities_type_fkey
    foreign key (organization_id, unavailability_type_id)
    references public.technician_unavailability_types (organization_id, id) on delete restrict,
  constraint technician_unavailabilities_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint technician_unavailabilities_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint technician_unavailabilities_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technician_unavailabilities_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technician_unavailabilities_organization_id_id_key
    unique (organization_id, id),
  constraint technician_unavailabilities_period_check check (ends_at > starts_at),
  constraint technician_unavailabilities_reason_format check (
    reason is null or (reason = btrim(reason) and char_length(reason) between 1 and 500)
  ),
  constraint technician_unavailabilities_notes_format check (
    notes is null or (notes = btrim(notes) and char_length(notes) between 1 and 2000)
  ),
  constraint technician_unavailabilities_no_active_overlap
    exclude using gist (
      organization_id with =,
      technician_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    ) where (active)
);

create table public.vehicle_unavailabilities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  vehicle_id uuid not null,
  unavailability_type_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  reason text,
  notes text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_unavailabilities_organization_fkey
    foreign key (organization_id) references public.organizations (id) on delete restrict,
  constraint vehicle_unavailabilities_vehicle_fkey
    foreign key (organization_id, vehicle_id)
    references public.vehicles (organization_id, id) on delete restrict,
  constraint vehicle_unavailabilities_type_fkey
    foreign key (organization_id, unavailability_type_id)
    references public.vehicle_unavailability_types (organization_id, id) on delete restrict,
  constraint vehicle_unavailabilities_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint vehicle_unavailabilities_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint vehicle_unavailabilities_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint vehicle_unavailabilities_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint vehicle_unavailabilities_organization_id_id_key
    unique (organization_id, id),
  constraint vehicle_unavailabilities_period_check check (ends_at > starts_at),
  constraint vehicle_unavailabilities_reason_format check (
    reason is null or (reason = btrim(reason) and char_length(reason) between 1 and 500)
  ),
  constraint vehicle_unavailabilities_notes_format check (
    notes is null or (notes = btrim(notes) and char_length(notes) between 1 and 2000)
  ),
  constraint vehicle_unavailabilities_no_active_overlap
    exclude using gist (
      organization_id with =,
      vehicle_id with =,
      tstzrange(starts_at, ends_at, '[)') with &&
    ) where (active)
);

create index technician_unavailabilities_organization_active_starts_idx
  on public.technician_unavailabilities (organization_id, active, starts_at);
create index technician_unavailabilities_resource_starts_idx
  on public.technician_unavailabilities (organization_id, technician_id, starts_at);
create index technician_unavailabilities_type_starts_idx
  on public.technician_unavailabilities (organization_id, unavailability_type_id, starts_at);
create index vehicle_unavailabilities_organization_active_starts_idx
  on public.vehicle_unavailabilities (organization_id, active, starts_at);
create index vehicle_unavailabilities_resource_starts_idx
  on public.vehicle_unavailabilities (organization_id, vehicle_id, starts_at);
create index vehicle_unavailabilities_type_starts_idx
  on public.vehicle_unavailabilities (organization_id, unavailability_type_id, starts_at);

create trigger technician_unavailability_types_set_updated_at
before update on public.technician_unavailability_types
for each row execute function private.set_updated_at();
create trigger vehicle_unavailability_types_set_updated_at
before update on public.vehicle_unavailability_types
for each row execute function private.set_updated_at();
create trigger technician_unavailabilities_set_updated_at
before update on public.technician_unavailabilities
for each row execute function private.set_updated_at();
create trigger vehicle_unavailabilities_set_updated_at
before update on public.vehicle_unavailabilities
for each row execute function private.set_updated_at();

create function private.is_active_technician_resource(
  target_organization_id uuid,
  target_technician_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.technicians
    where organization_id = target_organization_id
      and id = target_technician_id
      and active
  );
$$;

create function private.is_active_vehicle_resource(
  target_organization_id uuid,
  target_vehicle_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.vehicles
    where organization_id = target_organization_id
      and id = target_vehicle_id
      and active
  );
$$;

create function private.is_active_technician_unavailability_type(
  target_organization_id uuid,
  target_type_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.technician_unavailability_types
    where organization_id = target_organization_id and id = target_type_id and active
  );
$$;

create function private.is_active_vehicle_unavailability_type(
  target_organization_id uuid,
  target_type_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.vehicle_unavailability_types
    where organization_id = target_organization_id and id = target_type_id and active
  );
$$;

create function private.validate_technician_unavailability_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare organization_timezone text;
begin
  if tg_op = 'UPDATE' then
    if new.organization_id is distinct from old.organization_id
      or new.created_by is distinct from old.created_by then
      raise exception using errcode = 'P0001', message = 'unavailability_immutable_fields';
    end if;
    if old.ends_at <= now()
      and not private.has_organization_role(
        old.organization_id, array['admin']::public.organization_role[]
      )
      and not (
        old.active and not new.active
        and new.technician_id = old.technician_id
        and new.unavailability_type_id = old.unavailability_type_id
        and new.starts_at = old.starts_at and new.ends_at = old.ends_at
        and new.all_day = old.all_day
        and new.reason is not distinct from old.reason
        and new.notes is not distinct from old.notes
      ) then
      raise exception using errcode = 'P0001', message = 'past_unavailability_edit_forbidden';
    end if;
  end if;

  if new.all_day then
    select timezone into organization_timezone
    from public.organizations where id = new.organization_id;
    if date_trunc('day', new.starts_at at time zone organization_timezone)
        <> new.starts_at at time zone organization_timezone
      or date_trunc('day', new.ends_at at time zone organization_timezone)
        <> new.ends_at at time zone organization_timezone then
      raise exception using errcode = 'P0001', message = 'invalid_all_day_period';
    end if;
  end if;

  if tg_op = 'INSERT'
    or new.technician_id is distinct from old.technician_id
    or new.unavailability_type_id is distinct from old.unavailability_type_id
    or (new.active and (
      not old.active
      or new.starts_at is distinct from old.starts_at
      or new.ends_at is distinct from old.ends_at
      or new.all_day is distinct from old.all_day
    )) then
    if not private.is_active_technician_resource(new.organization_id, new.technician_id) then
      raise exception using errcode = 'P0001', message = 'unavailability_resource_not_available';
    end if;
    if not private.is_active_technician_unavailability_type(
      new.organization_id, new.unavailability_type_id
    ) then
      raise exception using errcode = 'P0001', message = 'unavailability_type_not_available';
    end if;
  end if;
  return new;
end;
$$;

create function private.validate_vehicle_unavailability_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare organization_timezone text;
begin
  if tg_op = 'UPDATE' then
    if new.organization_id is distinct from old.organization_id
      or new.created_by is distinct from old.created_by then
      raise exception using errcode = 'P0001', message = 'unavailability_immutable_fields';
    end if;
    if old.ends_at <= now()
      and not private.has_organization_role(
        old.organization_id, array['admin']::public.organization_role[]
      )
      and not (
        old.active and not new.active
        and new.vehicle_id = old.vehicle_id
        and new.unavailability_type_id = old.unavailability_type_id
        and new.starts_at = old.starts_at and new.ends_at = old.ends_at
        and new.all_day = old.all_day
        and new.reason is not distinct from old.reason
        and new.notes is not distinct from old.notes
      ) then
      raise exception using errcode = 'P0001', message = 'past_unavailability_edit_forbidden';
    end if;
  end if;

  if new.all_day then
    select timezone into organization_timezone
    from public.organizations where id = new.organization_id;
    if date_trunc('day', new.starts_at at time zone organization_timezone)
        <> new.starts_at at time zone organization_timezone
      or date_trunc('day', new.ends_at at time zone organization_timezone)
        <> new.ends_at at time zone organization_timezone then
      raise exception using errcode = 'P0001', message = 'invalid_all_day_period';
    end if;
  end if;

  if tg_op = 'INSERT'
    or new.vehicle_id is distinct from old.vehicle_id
    or new.unavailability_type_id is distinct from old.unavailability_type_id
    or (new.active and (
      not old.active
      or new.starts_at is distinct from old.starts_at
      or new.ends_at is distinct from old.ends_at
      or new.all_day is distinct from old.all_day
    )) then
    if not private.is_active_vehicle_resource(new.organization_id, new.vehicle_id) then
      raise exception using errcode = 'P0001', message = 'unavailability_resource_not_available';
    end if;
    if not private.is_active_vehicle_unavailability_type(
      new.organization_id, new.unavailability_type_id
    ) then
      raise exception using errcode = 'P0001', message = 'unavailability_type_not_available';
    end if;
  end if;
  return new;
end;
$$;

create trigger technician_unavailabilities_validate_write
before insert or update on public.technician_unavailabilities
for each row execute function private.validate_technician_unavailability_write();
create trigger vehicle_unavailabilities_validate_write
before insert or update on public.vehicle_unavailabilities
for each row execute function private.validate_vehicle_unavailability_write();

revoke all on function private.is_active_technician_resource(uuid, uuid) from public, anon, authenticated;
revoke all on function private.is_active_vehicle_resource(uuid, uuid) from public, anon, authenticated;
revoke all on function private.is_active_technician_unavailability_type(uuid, uuid) from public, anon, authenticated;
revoke all on function private.is_active_vehicle_unavailability_type(uuid, uuid) from public, anon, authenticated;
revoke all on function private.validate_technician_unavailability_write() from public, anon, authenticated;
revoke all on function private.validate_vehicle_unavailability_write() from public, anon, authenticated;
grant execute on function private.is_active_technician_resource(uuid, uuid) to authenticated;
grant execute on function private.is_active_vehicle_resource(uuid, uuid) to authenticated;
grant execute on function private.is_active_technician_unavailability_type(uuid, uuid) to authenticated;
grant execute on function private.is_active_vehicle_unavailability_type(uuid, uuid) to authenticated;

revoke all on public.technician_unavailability_types from anon, authenticated;
revoke all on public.vehicle_unavailability_types from anon, authenticated;
revoke all on public.technician_unavailabilities from anon, authenticated;
revoke all on public.vehicle_unavailabilities from anon, authenticated;

grant select on public.technician_unavailability_types, public.vehicle_unavailability_types to authenticated;
grant insert (organization_id, name, description, active, created_by, updated_by)
  on public.technician_unavailability_types, public.vehicle_unavailability_types to authenticated;
grant update (name, description, active, updated_by)
  on public.technician_unavailability_types, public.vehicle_unavailability_types to authenticated;

grant select on public.technician_unavailabilities, public.vehicle_unavailabilities to authenticated;
grant insert (
  organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  all_day, reason, notes, active, created_by, updated_by
) on public.technician_unavailabilities to authenticated;
grant update (
  technician_id, unavailability_type_id, starts_at, ends_at,
  all_day, reason, notes, active, updated_by
) on public.technician_unavailabilities to authenticated;
grant insert (
  organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at,
  all_day, reason, notes, active, created_by, updated_by
) on public.vehicle_unavailabilities to authenticated;
grant update (
  vehicle_id, unavailability_type_id, starts_at, ends_at,
  all_day, reason, notes, active, updated_by
) on public.vehicle_unavailabilities to authenticated;

alter table public.technician_unavailability_types enable row level security;
alter table public.vehicle_unavailability_types enable row level security;
alter table public.technician_unavailabilities enable row level security;
alter table public.vehicle_unavailabilities enable row level security;

create policy technician_unavailability_types_select_administrative
on public.technician_unavailability_types for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy technician_unavailability_types_insert_administrative
on public.technician_unavailability_types for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy technician_unavailability_types_update_administrative
on public.technician_unavailability_types for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);

create policy vehicle_unavailability_types_select_administrative
on public.vehicle_unavailability_types for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy vehicle_unavailability_types_insert_administrative
on public.vehicle_unavailability_types for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy vehicle_unavailability_types_update_administrative
on public.vehicle_unavailability_types for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);

create policy technician_unavailabilities_select_administrative
on public.technician_unavailabilities for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy technician_unavailabilities_select_own
on public.technician_unavailabilities for select to authenticated using (
  (select private.is_current_user_technician(organization_id, technician_id))
);
create policy technician_unavailabilities_insert_administrative
on public.technician_unavailabilities for insert to authenticated with check (
  active
  and (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and (select private.is_active_technician_resource(organization_id, technician_id))
  and (select private.is_active_technician_unavailability_type(
    organization_id, unavailability_type_id
  ))
  and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy technician_unavailabilities_update_administrative
on public.technician_unavailabilities for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);

create policy vehicle_unavailabilities_select_administrative
on public.vehicle_unavailabilities for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy vehicle_unavailabilities_insert_administrative
on public.vehicle_unavailabilities for insert to authenticated with check (
  active
  and (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and (select private.is_active_vehicle_resource(organization_id, vehicle_id))
  and (select private.is_active_vehicle_unavailability_type(
    organization_id, unavailability_type_id
  ))
  and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy vehicle_unavailabilities_update_administrative
on public.vehicle_unavailabilities for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);

reset search_path;
