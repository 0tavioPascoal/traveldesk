set search_path = public, extensions;

create table public.trip_required_skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  trip_id uuid not null,
  skill_id uuid not null,
  minimum_proficiency_level smallint not null,
  notes text,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_required_skills_trip_fkey
    foreign key (organization_id, trip_id)
    references public.trips (organization_id, id) on delete restrict,
  constraint trip_required_skills_skill_fkey
    foreign key (organization_id, skill_id)
    references public.skills (organization_id, id) on delete restrict,
  constraint trip_required_skills_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint trip_required_skills_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint trip_required_skills_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_required_skills_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_required_skills_organization_id_id_key
    unique (organization_id, id),
  constraint trip_required_skills_trip_skill_key
    unique (organization_id, trip_id, skill_id),
  constraint trip_required_skills_level_check
    check (minimum_proficiency_level between 1 and 5),
  constraint trip_required_skills_notes_format check (
    notes is null or (notes = btrim(notes) and char_length(notes) between 1 and 1000)
  )
);

create table public.trip_technicians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  trip_id uuid not null,
  technician_id uuid not null,
  is_responsible boolean not null default false,
  notes text,
  occupancy_starts_at timestamptz,
  occupancy_ends_at timestamptz,
  blocks_schedule boolean not null default false,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_technicians_trip_fkey
    foreign key (organization_id, trip_id)
    references public.trips (organization_id, id) on delete restrict,
  constraint trip_technicians_technician_fkey
    foreign key (organization_id, technician_id)
    references public.technicians (organization_id, id) on delete restrict,
  constraint trip_technicians_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint trip_technicians_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint trip_technicians_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_technicians_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_technicians_organization_id_id_key unique (organization_id, id),
  constraint trip_technicians_trip_technician_key
    unique (organization_id, trip_id, technician_id),
  constraint trip_technicians_notes_format check (
    notes is null or (notes = btrim(notes) and char_length(notes) between 1 and 1000)
  ),
  constraint trip_technicians_occupancy_pair check (
    (occupancy_starts_at is null) = (occupancy_ends_at is null)
  ),
  constraint trip_technicians_occupancy_order check (
    occupancy_starts_at is null or occupancy_ends_at > occupancy_starts_at
  ),
  constraint trip_technicians_blocking_has_period check (
    not blocks_schedule or occupancy_starts_at is not null
  ),
  constraint trip_technicians_no_planned_overlap
    exclude using gist (
      organization_id with =,
      technician_id with =,
      tstzrange(occupancy_starts_at, occupancy_ends_at, '[)') with &&
    ) where (blocks_schedule)
);

create index trip_required_skills_skill_idx
  on public.trip_required_skills (organization_id, skill_id, trip_id);
create index trip_technicians_technician_idx
  on public.trip_technicians (organization_id, technician_id, trip_id);
create unique index trip_technicians_one_responsible_key
  on public.trip_technicians (organization_id, trip_id) where is_responsible;

create trigger trip_required_skills_set_updated_at
before update on public.trip_required_skills
for each row execute function private.set_updated_at();
create trigger trip_technicians_set_updated_at
before update on public.trip_technicians
for each row execute function private.set_updated_at();

create function private.lock_technician_schedule(
  target_organization_id uuid,
  target_technician_id uuid
)
returns void language sql volatile security definer set search_path = '' as $$
  select pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      target_organization_id::text || ':' || target_technician_id::text,
      7219
    )
  );
$$;

create function private.trip_allows_staffing(
  target_organization_id uuid,
  target_trip_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.trips
    where organization_id = target_organization_id
      and id = target_trip_id
      and status in ('draft'::public.trip_status, 'planned'::public.trip_status)
  );
$$;

create function private.technician_has_unavailability(
  target_organization_id uuid,
  target_technician_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.technician_unavailabilities
    where organization_id = target_organization_id
      and technician_id = target_technician_id
      and active
      and starts_at < target_ends_at
      and ends_at > target_starts_at
  );
$$;

create function private.technician_has_trip_conflict(
  target_organization_id uuid,
  target_technician_id uuid,
  target_trip_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.trip_technicians
    where organization_id = target_organization_id
      and technician_id = target_technician_id
      and trip_id <> target_trip_id
      and blocks_schedule
      and occupancy_starts_at < target_ends_at
      and occupancy_ends_at > target_starts_at
  );
$$;

create function private.validate_trip_required_skill_write()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.has_organization_role(
    new.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) or not private.trip_allows_staffing(new.organization_id, new.trip_id) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;

  if tg_op = 'UPDATE' and (
    new.organization_id is distinct from old.organization_id
    or new.trip_id is distinct from old.trip_id
    or new.skill_id is distinct from old.skill_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception using errcode = 'P0001', message = 'trip_staffing_immutable_fields';
  end if;

  if tg_op = 'INSERT' and not private.is_active_skill(new.organization_id, new.skill_id) then
    raise exception using errcode = 'P0001', message = 'trip_skill_not_available';
  end if;

  if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

create function private.validate_trip_technician_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_status public.trip_status;
  current_starts_at timestamptz;
  current_ends_at timestamptz;
  technician_is_active boolean;
begin
  if not private.has_organization_role(
    new.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;

  select status, travel_starts_at, travel_ends_at
  into current_status, current_starts_at, current_ends_at
  from public.trips
  where organization_id = new.organization_id and id = new.trip_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;
  if current_status = 'canceled'::public.trip_status and tg_op = 'UPDATE'
    and new.organization_id = old.organization_id
    and new.trip_id = old.trip_id
    and new.technician_id = old.technician_id
    and new.is_responsible = old.is_responsible
    and new.notes is not distinct from old.notes
    and new.created_by = old.created_by
    and new.created_at = old.created_at then
    new.occupancy_starts_at := current_starts_at;
    new.occupancy_ends_at := current_ends_at;
    new.blocks_schedule := false;
    new.updated_by := auth.uid();
    return new;
  end if;
  if current_status not in (
    'draft'::public.trip_status, 'planned'::public.trip_status
  ) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;
  if current_starts_at is null or current_ends_at is null then
    raise exception using errcode = 'P0001', message = 'trip_period_required';
  end if;

  if tg_op = 'UPDATE' and (
    new.organization_id is distinct from old.organization_id
    or new.trip_id is distinct from old.trip_id
    or new.technician_id is distinct from old.technician_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception using errcode = 'P0001', message = 'trip_staffing_immutable_fields';
  end if;

  perform private.lock_technician_schedule(new.organization_id, new.technician_id);
  select active into technician_is_active
  from public.technicians
  where organization_id = new.organization_id and id = new.technician_id;

  if technician_is_active is null then
    raise exception using errcode = 'P0001', message = 'trip_technician_not_available';
  end if;
  if (tg_op = 'INSERT' or (not old.is_responsible and new.is_responsible))
    and not technician_is_active then
    raise exception using errcode = 'P0001', message = 'trip_technician_not_available';
  end if;
  if tg_op = 'INSERT' or (not old.is_responsible and new.is_responsible) then
    if private.technician_has_unavailability(
      new.organization_id, new.technician_id, current_starts_at, current_ends_at
    ) then
      raise exception using errcode = 'P0001', message = 'trip_technician_unavailable';
    end if;
    if private.technician_has_trip_conflict(
      new.organization_id, new.technician_id, new.trip_id,
      current_starts_at, current_ends_at
    ) then
      raise exception using errcode = 'P0001', message = 'trip_technician_schedule_conflict';
    end if;
  end if;

  new.occupancy_starts_at := current_starts_at;
  new.occupancy_ends_at := current_ends_at;
  new.blocks_schedule := current_status = 'planned'::public.trip_status;
  if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

create function private.validate_trip_staffing_delete()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.has_organization_role(
    old.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) or not private.trip_allows_staffing(old.organization_id, old.trip_id) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;
  if tg_table_name = 'trip_technicians' then
    perform private.lock_technician_schedule(old.organization_id, old.technician_id);
  end if;
  return old;
end;
$$;

create trigger trip_required_skills_validate_write
before insert or update on public.trip_required_skills
for each row execute function private.validate_trip_required_skill_write();
create trigger trip_required_skills_validate_delete
before delete on public.trip_required_skills
for each row execute function private.validate_trip_staffing_delete();
create trigger trip_technicians_validate_write
before insert or update on public.trip_technicians
for each row execute function private.validate_trip_technician_write();
create trigger trip_technicians_validate_delete
before delete on public.trip_technicians
for each row execute function private.validate_trip_staffing_delete();

create function private.validate_trip_schedule_against_team()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  assignment record;
begin
  if new.status = 'canceled'::public.trip_status
    or (new.status = 'draft'::public.trip_status
      and old.status is distinct from new.status
      and new.travel_starts_at is not distinct from old.travel_starts_at
      and new.travel_ends_at is not distinct from old.travel_ends_at) then
    return new;
  end if;

  if not (
    new.travel_starts_at is distinct from old.travel_starts_at
    or new.travel_ends_at is distinct from old.travel_ends_at
    or (new.status = 'planned'::public.trip_status and old.status <> new.status)
  ) then
    return new;
  end if;

  if exists (
    select 1 from public.trip_technicians
    where organization_id = new.organization_id and trip_id = new.id
  ) and (new.travel_starts_at is null or new.travel_ends_at is null) then
    raise exception using errcode = 'P0001', message = 'trip_period_required';
  end if;

  for assignment in
    select allocation.technician_id, technician.active
    from public.trip_technicians allocation
    join public.technicians technician
      on technician.organization_id = allocation.organization_id
      and technician.id = allocation.technician_id
    where allocation.organization_id = new.organization_id
      and allocation.trip_id = new.id
    order by allocation.technician_id
  loop
    perform private.lock_technician_schedule(new.organization_id, assignment.technician_id);
    if not assignment.active then
      raise exception using errcode = 'P0001', message = 'trip_technician_not_available';
    end if;
    if private.technician_has_unavailability(
      new.organization_id, assignment.technician_id,
      new.travel_starts_at, new.travel_ends_at
    ) then
      raise exception using errcode = 'P0001', message = 'trip_technician_unavailable';
    end if;
    if private.technician_has_trip_conflict(
      new.organization_id, assignment.technician_id, new.id,
      new.travel_starts_at, new.travel_ends_at
    ) then
      raise exception using errcode = 'P0001', message = 'trip_technician_schedule_conflict';
    end if;
  end loop;
  return new;
end;
$$;

create function private.sync_trip_technician_schedule()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.trip_technicians
  set occupancy_starts_at = new.travel_starts_at,
      occupancy_ends_at = new.travel_ends_at,
      blocks_schedule = new.status = 'planned'::public.trip_status,
      updated_by = auth.uid()
  where organization_id = new.organization_id and trip_id = new.id;
  return new;
end;
$$;

create trigger trips_team_validate_schedule
before update of travel_starts_at, travel_ends_at, status on public.trips
for each row execute function private.validate_trip_schedule_against_team();
create trigger trips_team_sync_schedule
after update of travel_starts_at, travel_ends_at, status on public.trips
for each row execute function private.sync_trip_technician_schedule();

create function private.guard_unavailability_against_planned_trips()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.active and (
    tg_op = 'INSERT'
    or not old.active
    or new.technician_id is distinct from old.technician_id
    or new.starts_at is distinct from old.starts_at
    or new.ends_at is distinct from old.ends_at
  ) then
    perform private.lock_technician_schedule(new.organization_id, new.technician_id);
    if exists (
      select 1 from public.trip_technicians
      where organization_id = new.organization_id
        and technician_id = new.technician_id
        and blocks_schedule
        and occupancy_starts_at < new.ends_at
        and occupancy_ends_at > new.starts_at
    ) then
      raise exception using errcode = 'P0001', message = 'technician_has_trip_conflict';
    end if;
  end if;
  return new;
end;
$$;

create trigger technician_unavailabilities_guard_planned_trips
before insert or update on public.technician_unavailabilities
for each row execute function private.guard_unavailability_against_planned_trips();

create function public.replace_trip_required_skills(
  p_organization_id uuid,
  p_trip_id uuid,
  p_requirements jsonb
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare trip_status public.trip_status;
begin
  if jsonb_typeof(coalesce(p_requirements, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_requirements, '[]'::jsonb)) > 25 then
    raise exception using errcode = 'P0001', message = 'trip_invalid_requirements';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(coalesce(p_requirements, '[]'::jsonb))
      as requirement(skill_id uuid, minimum_proficiency_level smallint, notes text)
    group by skill_id having count(*) > 1
  ) then
    raise exception using errcode = 'P0001', message = 'trip_invalid_requirements';
  end if;

  select status into trip_status from public.trips
  where organization_id = p_organization_id and id = p_trip_id for update;
  if not found or trip_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_requirements, '[]'::jsonb))
      as requirement(skill_id uuid, minimum_proficiency_level smallint, notes text)
    left join public.skills skill
      on skill.organization_id = p_organization_id and skill.id = requirement.skill_id
    left join public.trip_required_skills existing
      on existing.organization_id = p_organization_id
      and existing.trip_id = p_trip_id and existing.skill_id = requirement.skill_id
    where skill.id is null
      or (not skill.active and existing.id is null)
      or requirement.minimum_proficiency_level not between 1 and 5
      or (requirement.notes is not null and char_length(requirement.notes) > 1000)
  ) then
    raise exception using errcode = 'P0001', message = 'trip_skill_not_available';
  end if;

  delete from public.trip_required_skills existing
  where existing.organization_id = p_organization_id and existing.trip_id = p_trip_id
    and not exists (
      select 1 from jsonb_to_recordset(coalesce(p_requirements, '[]'::jsonb))
        as requirement(skill_id uuid, minimum_proficiency_level smallint, notes text)
      where requirement.skill_id = existing.skill_id
    );

  insert into public.trip_required_skills (
    organization_id, trip_id, skill_id, minimum_proficiency_level, notes,
    created_by, updated_by
  )
  select p_organization_id, p_trip_id, requirement.skill_id,
    requirement.minimum_proficiency_level, nullif(btrim(requirement.notes), ''),
    auth.uid(), auth.uid()
  from jsonb_to_recordset(coalesce(p_requirements, '[]'::jsonb))
    as requirement(skill_id uuid, minimum_proficiency_level smallint, notes text)
  on conflict (organization_id, trip_id, skill_id) do update set
    minimum_proficiency_level = excluded.minimum_proficiency_level,
    notes = excluded.notes,
    updated_by = auth.uid();
  return true;
end;
$$;

create function public.replace_trip_technicians(
  p_organization_id uuid,
  p_trip_id uuid,
  p_technicians jsonb
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  trip_status public.trip_status;
  trip_starts_at timestamptz;
  trip_ends_at timestamptz;
  target_id uuid;
begin
  if jsonb_typeof(coalesce(p_technicians, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_technicians, '[]'::jsonb)) > 30 then
    raise exception using errcode = 'P0001', message = 'trip_invalid_team';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
      as member(technician_id uuid, is_responsible boolean, notes text)
    group by technician_id having count(*) > 1
  ) or (
    select count(*) from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
      as member(technician_id uuid, is_responsible boolean, notes text)
    where coalesce(is_responsible, false)
  ) > 1 then
    raise exception using errcode = 'P0001', message = 'trip_invalid_team';
  end if;

  select status, travel_starts_at, travel_ends_at
  into trip_status, trip_starts_at, trip_ends_at
  from public.trips
  where organization_id = p_organization_id and id = p_trip_id for update;
  if not found or trip_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;
  if trip_starts_at is null or trip_ends_at is null then
    raise exception using errcode = 'P0001', message = 'trip_period_required';
  end if;

  for target_id in
    select technician_id from (
      select technician_id from public.trip_technicians
      where organization_id = p_organization_id and trip_id = p_trip_id
      union
      select member.technician_id
      from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
        as member(technician_id uuid, is_responsible boolean, notes text)
    ) targets order by technician_id
  loop
    perform private.lock_technician_schedule(p_organization_id, target_id);
  end loop;

  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
      as member(technician_id uuid, is_responsible boolean, notes text)
    left join public.technicians technician
      on technician.organization_id = p_organization_id and technician.id = member.technician_id
    left join public.trip_technicians existing
      on existing.organization_id = p_organization_id
      and existing.trip_id = p_trip_id and existing.technician_id = member.technician_id
    where technician.id is null
      or (not technician.active and (existing.id is null or coalesce(member.is_responsible, false)))
      or (member.notes is not null and char_length(member.notes) > 1000)
  ) then
    raise exception using errcode = 'P0001', message = 'trip_technician_not_available';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
      as member(technician_id uuid, is_responsible boolean, notes text)
    left join public.trip_technicians existing
      on existing.organization_id = p_organization_id
      and existing.trip_id = p_trip_id and existing.technician_id = member.technician_id
    where existing.id is null and private.technician_has_unavailability(
      p_organization_id, member.technician_id, trip_starts_at, trip_ends_at
    )
  ) then
    raise exception using errcode = 'P0001', message = 'trip_technician_unavailable';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
      as member(technician_id uuid, is_responsible boolean, notes text)
    left join public.trip_technicians existing
      on existing.organization_id = p_organization_id
      and existing.trip_id = p_trip_id and existing.technician_id = member.technician_id
    where existing.id is null and private.technician_has_trip_conflict(
      p_organization_id, member.technician_id, p_trip_id, trip_starts_at, trip_ends_at
    )
  ) then
    raise exception using errcode = 'P0001', message = 'trip_technician_schedule_conflict';
  end if;

  delete from public.trip_technicians existing
  where existing.organization_id = p_organization_id and existing.trip_id = p_trip_id
    and not exists (
      select 1 from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
        as member(technician_id uuid, is_responsible boolean, notes text)
      where member.technician_id = existing.technician_id
    );

  update public.trip_technicians set is_responsible = false, updated_by = auth.uid()
  where organization_id = p_organization_id and trip_id = p_trip_id and is_responsible;

  insert into public.trip_technicians (
    organization_id, trip_id, technician_id, is_responsible, notes,
    created_by, updated_by
  )
  select p_organization_id, p_trip_id, member.technician_id,
    coalesce(member.is_responsible, false), nullif(btrim(member.notes), ''),
    auth.uid(), auth.uid()
  from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
    as member(technician_id uuid, is_responsible boolean, notes text)
  on conflict (organization_id, trip_id, technician_id) do update set
    is_responsible = excluded.is_responsible,
    notes = excluded.notes,
    updated_by = auth.uid();
  return true;
end;
$$;

create function public.set_trip_responsible_technician(
  p_organization_id uuid,
  p_trip_id uuid,
  p_technician_id uuid
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  trip_status public.trip_status;
  trip_starts_at timestamptz;
  trip_ends_at timestamptz;
begin
  select status, travel_starts_at, travel_ends_at
  into trip_status, trip_starts_at, trip_ends_at
  from public.trips
  where organization_id = p_organization_id and id = p_trip_id for update;
  if not found or trip_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_not_editable';
  end if;

  if p_technician_id is not null then
    perform private.lock_technician_schedule(p_organization_id, p_technician_id);
    if not exists (
      select 1 from public.trip_technicians allocation
      join public.technicians technician
        on technician.organization_id = allocation.organization_id
        and technician.id = allocation.technician_id
      where allocation.organization_id = p_organization_id
        and allocation.trip_id = p_trip_id
        and allocation.technician_id = p_technician_id
        and technician.active
    ) then
      raise exception using errcode = 'P0001', message = 'trip_responsible_not_allocated';
    end if;
    if private.technician_has_unavailability(
      p_organization_id, p_technician_id, trip_starts_at, trip_ends_at
    ) or private.technician_has_trip_conflict(
      p_organization_id, p_technician_id, p_trip_id, trip_starts_at, trip_ends_at
    ) then
      raise exception using errcode = 'P0001', message = 'trip_technician_unavailable';
    end if;
  end if;

  update public.trip_technicians set is_responsible = false, updated_by = auth.uid()
  where organization_id = p_organization_id and trip_id = p_trip_id and is_responsible;
  if p_technician_id is not null then
    update public.trip_technicians set is_responsible = true, updated_by = auth.uid()
    where organization_id = p_organization_id and trip_id = p_trip_id
      and technician_id = p_technician_id;
  end if;
  return true;
end;
$$;

revoke all on function private.lock_technician_schedule(uuid, uuid) from public, anon, authenticated;
revoke all on function private.trip_allows_staffing(uuid, uuid) from public, anon, authenticated;
revoke all on function private.technician_has_unavailability(uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function private.technician_has_trip_conflict(uuid, uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function private.validate_trip_required_skill_write() from public, anon, authenticated;
revoke all on function private.validate_trip_technician_write() from public, anon, authenticated;
revoke all on function private.validate_trip_staffing_delete() from public, anon, authenticated;
revoke all on function private.validate_trip_schedule_against_team() from public, anon, authenticated;
revoke all on function private.sync_trip_technician_schedule() from public, anon, authenticated;
revoke all on function private.guard_unavailability_against_planned_trips() from public, anon, authenticated;
grant execute on function private.lock_technician_schedule(uuid, uuid) to authenticated;
grant execute on function private.technician_has_unavailability(uuid, uuid, timestamptz, timestamptz) to authenticated;
grant execute on function private.technician_has_trip_conflict(uuid, uuid, uuid, timestamptz, timestamptz) to authenticated;

revoke all on function public.replace_trip_required_skills(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.replace_trip_technicians(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.set_trip_responsible_technician(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.replace_trip_required_skills(uuid, uuid, jsonb) to authenticated;
grant execute on function public.replace_trip_technicians(uuid, uuid, jsonb) to authenticated;
grant execute on function public.set_trip_responsible_technician(uuid, uuid, uuid) to authenticated;

revoke all on public.trip_required_skills, public.trip_technicians from anon, authenticated;
grant select, delete on public.trip_required_skills, public.trip_technicians to authenticated;
grant insert (
  organization_id, trip_id, skill_id, minimum_proficiency_level, notes,
  created_by, updated_by
) on public.trip_required_skills to authenticated;
grant update (minimum_proficiency_level, notes, updated_by)
  on public.trip_required_skills to authenticated;
grant insert (
  organization_id, trip_id, technician_id, is_responsible, notes,
  created_by, updated_by
) on public.trip_technicians to authenticated;
grant update (is_responsible, notes, updated_by)
  on public.trip_technicians to authenticated;

alter table public.trip_required_skills enable row level security;
alter table public.trip_technicians enable row level security;

create policy trip_required_skills_select_administrative
on public.trip_required_skills for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy trip_required_skills_insert_administrative
on public.trip_required_skills for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy trip_required_skills_update_administrative
on public.trip_required_skills for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);
create policy trip_required_skills_delete_administrative
on public.trip_required_skills for delete to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy trip_technicians_select_administrative
on public.trip_technicians for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy trip_technicians_insert_administrative
on public.trip_technicians for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy trip_technicians_update_administrative
on public.trip_technicians for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);
create policy trip_technicians_delete_administrative
on public.trip_technicians for delete to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);

reset search_path;
