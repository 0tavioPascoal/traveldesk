set search_path = public, extensions;

create table public.trip_vehicle_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  trip_id uuid not null,
  vehicle_id uuid not null,
  driver_technician_id uuid not null,
  notes text,
  occupancy_starts_at timestamptz,
  occupancy_ends_at timestamptz,
  blocks_schedule boolean not null default false,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_vehicle_assignments_trip_fkey
    foreign key (organization_id, trip_id)
    references public.trips (organization_id, id) on delete restrict,
  constraint trip_vehicle_assignments_vehicle_fkey
    foreign key (organization_id, vehicle_id)
    references public.vehicles (organization_id, id) on delete restrict,
  constraint trip_vehicle_assignments_driver_fkey
    foreign key (organization_id, trip_id, driver_technician_id)
    references public.trip_technicians (organization_id, trip_id, technician_id)
    on delete restrict,
  constraint trip_vehicle_assignments_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint trip_vehicle_assignments_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint trip_vehicle_assignments_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_vehicle_assignments_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_vehicle_assignments_organization_id_id_key
    unique (organization_id, id),
  constraint trip_vehicle_assignments_trip_key
    unique (organization_id, trip_id),
  constraint trip_vehicle_assignments_notes_format check (
    notes is null or (notes = btrim(notes) and char_length(notes) between 1 and 1000)
  ),
  constraint trip_vehicle_assignments_occupancy_pair check (
    (occupancy_starts_at is null) = (occupancy_ends_at is null)
  ),
  constraint trip_vehicle_assignments_occupancy_order check (
    occupancy_starts_at is null or occupancy_ends_at > occupancy_starts_at
  ),
  constraint trip_vehicle_assignments_blocking_has_period check (
    not blocks_schedule or occupancy_starts_at is not null
  ),
  constraint trip_vehicle_assignments_no_planned_overlap
    exclude using gist (
      organization_id with =,
      vehicle_id with =,
      tstzrange(occupancy_starts_at, occupancy_ends_at, '[)') with &&
    ) where (blocks_schedule)
);

create index trip_vehicle_assignments_vehicle_idx
  on public.trip_vehicle_assignments (organization_id, vehicle_id, trip_id);
create index trip_vehicle_assignments_driver_idx
  on public.trip_vehicle_assignments (organization_id, driver_technician_id, trip_id);

create trigger trip_vehicle_assignments_set_updated_at
before update on public.trip_vehicle_assignments
for each row execute function private.set_updated_at();

create function private.lock_vehicle_schedule(
  target_organization_id uuid,
  target_vehicle_id uuid
)
returns void language sql volatile security definer set search_path = '' as $$
  select pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      target_organization_id::text || ':' || target_vehicle_id::text,
      8261
    )
  );
$$;

create function private.vehicle_has_unavailability(
  target_organization_id uuid,
  target_vehicle_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.vehicle_unavailabilities
    where organization_id = target_organization_id
      and vehicle_id = target_vehicle_id
      and active
      and starts_at < target_ends_at
      and ends_at > target_starts_at
  );
$$;

create function private.vehicle_has_trip_conflict(
  target_organization_id uuid,
  target_vehicle_id uuid,
  target_trip_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.trip_vehicle_assignments
    where organization_id = target_organization_id
      and vehicle_id = target_vehicle_id
      and trip_id <> target_trip_id
      and blocks_schedule
      and occupancy_starts_at < target_ends_at
      and occupancy_ends_at > target_starts_at
  );
$$;

create function private.validate_trip_transport(
  target_organization_id uuid,
  target_trip_id uuid,
  target_vehicle_id uuid,
  target_driver_technician_id uuid,
  target_starts_at timestamptz,
  target_ends_at timestamptz
)
returns void language plpgsql stable security definer set search_path = '' as $$
declare
  target_timezone text;
  vehicle_capacity smallint;
  team_size integer;
  driver_record record;
begin
  if target_starts_at is null or target_ends_at is null or target_ends_at <= target_starts_at then
    raise exception using errcode = 'P0001', message = 'trip_transport_period_required';
  end if;

  select vehicle.passenger_capacity into vehicle_capacity
  from public.vehicles vehicle
  where vehicle.organization_id = target_organization_id
    and vehicle.id = target_vehicle_id
    and vehicle.active
    and vehicle.operational_status = 'available'::public.vehicle_operational_status;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_vehicle_not_available';
  end if;

  select count(*)::integer into team_size
  from public.trip_technicians
  where organization_id = target_organization_id and trip_id = target_trip_id;
  if team_size = 0 then
    raise exception using errcode = 'P0001', message = 'trip_transport_team_required';
  end if;
  if team_size > vehicle_capacity then
    raise exception using errcode = 'P0001', message = 'trip_vehicle_capacity_exceeded';
  end if;

  select technician.active, technician.can_drive_company_vehicle,
    technician.driver_license_number, technician.driver_license_category,
    technician.driver_license_expires_at, organization.timezone
  into driver_record
  from public.trip_technicians allocation
  join public.technicians technician
    on technician.organization_id = allocation.organization_id
    and technician.id = allocation.technician_id
  join public.organizations organization on organization.id = allocation.organization_id
  where allocation.organization_id = target_organization_id
    and allocation.trip_id = target_trip_id
    and allocation.technician_id = target_driver_technician_id;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_driver_not_allocated';
  end if;
  if not driver_record.active
    or not driver_record.can_drive_company_vehicle
    or driver_record.driver_license_number is null
    or driver_record.driver_license_category is null
    or driver_record.driver_license_expires_at is null then
    raise exception using errcode = 'P0001', message = 'trip_driver_not_eligible';
  end if;
  target_timezone := driver_record.timezone;
  if driver_record.driver_license_expires_at
    < (target_ends_at at time zone target_timezone)::date then
    raise exception using errcode = 'P0001', message = 'trip_driver_license_expired';
  end if;

  if private.vehicle_has_unavailability(
    target_organization_id, target_vehicle_id, target_starts_at, target_ends_at
  ) then
    raise exception using errcode = 'P0001', message = 'trip_vehicle_unavailable';
  end if;
  if private.vehicle_has_trip_conflict(
    target_organization_id, target_vehicle_id, target_trip_id,
    target_starts_at, target_ends_at
  ) then
    raise exception using errcode = 'P0001', message = 'trip_vehicle_schedule_conflict';
  end if;
  if private.technician_has_unavailability(
    target_organization_id, target_driver_technician_id, target_starts_at, target_ends_at
  ) or private.technician_has_trip_conflict(
    target_organization_id, target_driver_technician_id, target_trip_id,
    target_starts_at, target_ends_at
  ) then
    raise exception using errcode = 'P0001', message = 'trip_driver_unavailable';
  end if;
end;
$$;

create function private.validate_trip_vehicle_assignment_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_status public.trip_status;
  current_starts_at timestamptz;
  current_ends_at timestamptz;
  target_vehicle_id uuid;
begin
  if not private.has_organization_role(
    new.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;

  select status, travel_starts_at, travel_ends_at
  into current_status, current_starts_at, current_ends_at
  from public.trips
  where organization_id = new.organization_id and id = new.trip_id
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;

  if current_status = 'canceled'::public.trip_status and tg_op = 'UPDATE'
    and new.organization_id = old.organization_id
    and new.trip_id = old.trip_id
    and new.vehicle_id = old.vehicle_id
    and new.driver_technician_id = old.driver_technician_id
    and new.notes is not distinct from old.notes
    and new.created_by = old.created_by
    and new.created_at = old.created_at then
    new.occupancy_starts_at := current_starts_at;
    new.occupancy_ends_at := current_ends_at;
    new.blocks_schedule := false;
    new.updated_by := auth.uid();
    return new;
  end if;
  if current_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;

  if tg_op = 'UPDATE' and (
    new.organization_id is distinct from old.organization_id
    or new.trip_id is distinct from old.trip_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception using errcode = 'P0001', message = 'trip_transport_immutable_fields';
  end if;

  for target_vehicle_id in
    select vehicle_id from (
      select new.vehicle_id
      union
      select old.vehicle_id where tg_op = 'UPDATE'
    ) vehicles order by vehicle_id
  loop
    perform private.lock_vehicle_schedule(new.organization_id, target_vehicle_id);
  end loop;
  perform private.lock_technician_schedule(new.organization_id, new.driver_technician_id);
  perform private.validate_trip_transport(
    new.organization_id, new.trip_id, new.vehicle_id, new.driver_technician_id,
    current_starts_at, current_ends_at
  );

  new.occupancy_starts_at := current_starts_at;
  new.occupancy_ends_at := current_ends_at;
  new.blocks_schedule := current_status = 'planned'::public.trip_status;
  if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

create function private.validate_trip_vehicle_assignment_delete()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not private.has_organization_role(
    old.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) or not private.trip_allows_staffing(old.organization_id, old.trip_id) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;
  perform private.lock_vehicle_schedule(old.organization_id, old.vehicle_id);
  return old;
end;
$$;

create trigger trip_vehicle_assignments_validate_write
before insert or update on public.trip_vehicle_assignments
for each row execute function private.validate_trip_vehicle_assignment_write();
create trigger trip_vehicle_assignments_validate_delete
before delete on public.trip_vehicle_assignments
for each row execute function private.validate_trip_vehicle_assignment_delete();

create function private.validate_trip_schedule_against_transport()
returns trigger language plpgsql security definer set search_path = '' as $$
declare assignment record;
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

  select vehicle_id, driver_technician_id into assignment
  from public.trip_vehicle_assignments
  where organization_id = new.organization_id and trip_id = new.id;
  if not found then return new; end if;

  perform private.lock_vehicle_schedule(new.organization_id, assignment.vehicle_id);
  perform private.lock_technician_schedule(new.organization_id, assignment.driver_technician_id);
  perform private.validate_trip_transport(
    new.organization_id, new.id, assignment.vehicle_id,
    assignment.driver_technician_id, new.travel_starts_at, new.travel_ends_at
  );
  return new;
end;
$$;

create function private.sync_trip_vehicle_schedule()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.trip_vehicle_assignments
  set occupancy_starts_at = new.travel_starts_at,
      occupancy_ends_at = new.travel_ends_at,
      blocks_schedule = new.status = 'planned'::public.trip_status,
      updated_by = auth.uid()
  where organization_id = new.organization_id and trip_id = new.id;
  return new;
end;
$$;

create trigger trips_transport_validate_schedule
before update of travel_starts_at, travel_ends_at, status on public.trips
for each row execute function private.validate_trip_schedule_against_transport();
create trigger trips_transport_sync_schedule
after update of travel_starts_at, travel_ends_at, status on public.trips
for each row execute function private.sync_trip_vehicle_schedule();

create function private.guard_vehicle_unavailability_against_planned_trips()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.active and (
    tg_op = 'INSERT' or not old.active
    or new.vehicle_id is distinct from old.vehicle_id
    or new.starts_at is distinct from old.starts_at
    or new.ends_at is distinct from old.ends_at
  ) then
    perform private.lock_vehicle_schedule(new.organization_id, new.vehicle_id);
    if exists (
      select 1 from public.trip_vehicle_assignments
      where organization_id = new.organization_id
        and vehicle_id = new.vehicle_id
        and blocks_schedule
        and occupancy_starts_at < new.ends_at
        and occupancy_ends_at > new.starts_at
    ) then
      raise exception using errcode = 'P0001', message = 'vehicle_has_trip_conflict';
    end if;
  end if;
  return new;
end;
$$;

create trigger vehicle_unavailabilities_guard_planned_trips
before insert or update on public.vehicle_unavailabilities
for each row execute function private.guard_vehicle_unavailability_against_planned_trips();

create function public.assign_trip_vehicle_and_driver(
  p_organization_id uuid,
  p_trip_id uuid,
  p_vehicle_id uuid,
  p_driver_technician_id uuid,
  p_notes text
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  trip_status public.trip_status;
  trip_starts_at timestamptz;
  trip_ends_at timestamptz;
  current_vehicle_id uuid;
  target_vehicle_id uuid;
begin
  if not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;
  if p_notes is not null and char_length(btrim(p_notes)) > 1000 then
    raise exception using errcode = 'P0001', message = 'trip_transport_invalid';
  end if;

  select status, travel_starts_at, travel_ends_at
  into trip_status, trip_starts_at, trip_ends_at
  from public.trips
  where organization_id = p_organization_id and id = p_trip_id
  for update;
  if not found or trip_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;

  select vehicle_id into current_vehicle_id
  from public.trip_vehicle_assignments
  where organization_id = p_organization_id and trip_id = p_trip_id;
  for target_vehicle_id in
    select vehicle_id from (
      select p_vehicle_id as vehicle_id
      union
      select current_vehicle_id where current_vehicle_id is not null
    ) vehicles order by vehicle_id
  loop
    perform private.lock_vehicle_schedule(p_organization_id, target_vehicle_id);
  end loop;
  perform private.lock_technician_schedule(p_organization_id, p_driver_technician_id);
  perform private.validate_trip_transport(
    p_organization_id, p_trip_id, p_vehicle_id, p_driver_technician_id,
    trip_starts_at, trip_ends_at
  );

  insert into public.trip_vehicle_assignments (
    organization_id, trip_id, vehicle_id, driver_technician_id, notes,
    created_by, updated_by
  ) values (
    p_organization_id, p_trip_id, p_vehicle_id, p_driver_technician_id,
    nullif(btrim(p_notes), ''), auth.uid(), auth.uid()
  )
  on conflict (organization_id, trip_id) do update set
    vehicle_id = excluded.vehicle_id,
    driver_technician_id = excluded.driver_technician_id,
    notes = excluded.notes,
    updated_by = auth.uid();
  return true;
end;
$$;

create function public.remove_trip_vehicle_assignment(
  p_organization_id uuid,
  p_trip_id uuid
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;
  perform 1 from public.trips
  where organization_id = p_organization_id and id = p_trip_id
    and status in ('draft'::public.trip_status, 'planned'::public.trip_status)
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;
  delete from public.trip_vehicle_assignments
  where organization_id = p_organization_id and trip_id = p_trip_id;
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

create or replace function public.replace_trip_technicians(
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
  assigned_driver_id uuid;
  assigned_vehicle_capacity smallint;
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

  select assignment.driver_technician_id, vehicle.passenger_capacity
  into assigned_driver_id, assigned_vehicle_capacity
  from public.trip_vehicle_assignments assignment
  join public.vehicles vehicle
    on vehicle.organization_id = assignment.organization_id
    and vehicle.id = assignment.vehicle_id
  where assignment.organization_id = p_organization_id
    and assignment.trip_id = p_trip_id;
  if assigned_driver_id is not null and not exists (
    select 1 from jsonb_to_recordset(coalesce(p_technicians, '[]'::jsonb))
      as member(technician_id uuid, is_responsible boolean, notes text)
    where member.technician_id = assigned_driver_id
  ) then
    raise exception using errcode = 'P0001', message = 'trip_driver_assigned';
  end if;
  if assigned_vehicle_capacity is not null
    and jsonb_array_length(coalesce(p_technicians, '[]'::jsonb)) > assigned_vehicle_capacity then
    raise exception using errcode = 'P0001', message = 'trip_vehicle_capacity_exceeded';
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

revoke all on function private.lock_vehicle_schedule(uuid, uuid) from public, anon, authenticated;
revoke all on function private.vehicle_has_unavailability(uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function private.vehicle_has_trip_conflict(uuid, uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function private.validate_trip_transport(uuid, uuid, uuid, uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function private.validate_trip_vehicle_assignment_write() from public, anon, authenticated;
revoke all on function private.validate_trip_vehicle_assignment_delete() from public, anon, authenticated;
revoke all on function private.validate_trip_schedule_against_transport() from public, anon, authenticated;
revoke all on function private.sync_trip_vehicle_schedule() from public, anon, authenticated;
revoke all on function private.guard_vehicle_unavailability_against_planned_trips() from public, anon, authenticated;
grant execute on function private.lock_vehicle_schedule(uuid, uuid) to authenticated;
grant execute on function private.vehicle_has_unavailability(uuid, uuid, timestamptz, timestamptz) to authenticated;
grant execute on function private.vehicle_has_trip_conflict(uuid, uuid, uuid, timestamptz, timestamptz) to authenticated;
grant execute on function private.validate_trip_transport(uuid, uuid, uuid, uuid, timestamptz, timestamptz) to authenticated;
grant execute on function private.trip_allows_staffing(uuid, uuid) to authenticated;

revoke all on function public.assign_trip_vehicle_and_driver(uuid, uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.remove_trip_vehicle_assignment(uuid, uuid) from public, anon, authenticated;
grant execute on function public.assign_trip_vehicle_and_driver(uuid, uuid, uuid, uuid, text) to authenticated;
grant execute on function public.remove_trip_vehicle_assignment(uuid, uuid) to authenticated;

revoke all on public.trip_vehicle_assignments from anon, authenticated;
grant select, delete on public.trip_vehicle_assignments to authenticated;
grant insert (
  organization_id, trip_id, vehicle_id, driver_technician_id, notes,
  created_by, updated_by
) on public.trip_vehicle_assignments to authenticated;
grant update (vehicle_id, driver_technician_id, notes, updated_by)
  on public.trip_vehicle_assignments to authenticated;

alter table public.trip_vehicle_assignments enable row level security;

create policy trip_vehicle_assignments_select_administrative
on public.trip_vehicle_assignments for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy trip_vehicle_assignments_insert_administrative
on public.trip_vehicle_assignments for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and created_by = (select auth.uid()) and updated_by = (select auth.uid())
);
create policy trip_vehicle_assignments_update_administrative
on public.trip_vehicle_assignments for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and updated_by = (select auth.uid())
);
create policy trip_vehicle_assignments_delete_administrative
on public.trip_vehicle_assignments for delete to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  )) and (select private.trip_allows_staffing(organization_id, trip_id))
);
