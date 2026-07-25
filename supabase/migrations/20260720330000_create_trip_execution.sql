set search_path = public, extensions;

alter table public.trips
  add column finished_at timestamptz,
  add column finished_by uuid,
  add constraint trips_finished_by_fkey
    foreign key (finished_by) references public.profiles (id) on delete restrict,
  add constraint trips_finished_by_membership_fkey
    foreign key (organization_id, finished_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  add constraint trips_finished_pair check ((finished_at is null) = (finished_by is null));

alter table public.trips drop constraint trips_confirmation_state;
alter table public.trips add constraint trips_confirmation_state check (
  (status in (
    'confirmed'::public.trip_status, 'traveling'::public.trip_status,
    'at_client'::public.trip_status, 'in_service'::public.trip_status,
    'returning'::public.trip_status, 'finished'::public.trip_status
  ) and confirmed_at is not null)
  or status = 'canceled'::public.trip_status
  or (status in ('draft'::public.trip_status, 'planned'::public.trip_status)
    and confirmed_at is null)
);

alter table public.trips drop constraint trips_confirmed_is_complete;
alter table public.trips add constraint trips_confirmed_is_complete check (
  status not in (
    'confirmed'::public.trip_status, 'traveling'::public.trip_status,
    'at_client'::public.trip_status, 'in_service'::public.trip_status,
    'returning'::public.trip_status, 'finished'::public.trip_status
  ) or (
    service_type_id is not null
    and travel_starts_at is not null and travel_ends_at is not null
    and service_starts_at is not null and service_ends_at is not null
    and origin_city is not null and origin_state is not null
    and destination_city is not null and destination_state is not null
  )
);

alter table public.trips add constraint trips_finished_state check (
  (status = 'finished'::public.trip_status and finished_at is not null)
  or (status <> 'finished'::public.trip_status and finished_at is null)
  or (status = 'canceled'::public.trip_status and finished_at is not null)
);

create table public.trip_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  trip_id uuid not null,
  from_status public.trip_status not null,
  to_status public.trip_status not null,
  occurred_at timestamptz not null default clock_timestamp(),
  changed_by uuid not null,
  note text,
  created_at timestamptz not null default now(),
  constraint trip_status_history_trip_fkey
    foreign key (organization_id, trip_id)
    references public.trips (organization_id, id) on delete restrict,
  constraint trip_status_history_changed_by_fkey
    foreign key (changed_by) references public.profiles (id) on delete restrict,
  constraint trip_status_history_changed_by_membership_fkey
    foreign key (organization_id, changed_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_status_history_changed check (from_status <> to_status),
  constraint trip_status_history_note_format check (
    note is null or (note = btrim(note) and char_length(note) between 1 and 1000)
  )
);

create index trip_status_history_trip_occurred_idx
  on public.trip_status_history (organization_id, trip_id, occurred_at, id);

alter table public.trip_status_history enable row level security;

create or replace function private.is_trip_responsible_user(
  target_organization_id uuid,
  target_trip_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_organization_role(
    target_organization_id, array['technician']::public.organization_role[]
  ) and exists (
    select 1
    from public.trip_technicians allocation
    join public.technicians technician
      on technician.organization_id = allocation.organization_id
      and technician.id = allocation.technician_id
    where allocation.organization_id = target_organization_id
      and allocation.trip_id = target_trip_id
      and allocation.is_responsible
      and technician.active
      and technician.profile_id = auth.uid()
  );
$$;

create or replace function private.can_view_trip_execution(
  target_organization_id uuid,
  target_trip_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.has_organization_role(
    target_organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ) or (
    private.has_organization_role(
      target_organization_id, array['technician']::public.organization_role[]
    ) and exists (
      select 1
      from public.trip_technicians allocation
      join public.technicians technician
        on technician.organization_id = allocation.organization_id
        and technician.id = allocation.technician_id
      where allocation.organization_id = target_organization_id
        and allocation.trip_id = target_trip_id
        and technician.profile_id = auth.uid()
    )
  );
$$;

create policy trip_status_history_select_authorized
on public.trip_status_history for select to authenticated
using (private.can_view_trip_execution(organization_id, trip_id));

grant select on public.trip_status_history to authenticated;

create or replace function private.validate_trip_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  organization_timezone text;
  client_display_name text;
  client_legal_name text;
  client_trade_name text;
  unit_name text;
  unit_city text;
  unit_state text;
  relationships_changed boolean;
  valid_execution_transition boolean := false;
begin
  if tg_op = 'INSERT' then
    if new.status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
      raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
    end if;
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
    new.confirmed_at := null; new.confirmed_by := null;
    new.finished_at := null; new.finished_by := null;
    new.cancellation_reason := null; new.canceled_at := null; new.canceled_by := null;
    select timezone into organization_timezone from public.organizations where id = new.organization_id;
    new.code := format('VGM-%s-%s',
      extract(year from new.created_at at time zone organization_timezone)::integer,
      lpad(nextval('public.trip_code_sequence')::text, 6, '0'));
    relationships_changed := true;
  else
    if new.organization_id is distinct from old.organization_id
      or new.code is distinct from old.code
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at then
      raise exception using errcode = 'P0001', message = 'trip_immutable_fields';
    end if;
    new.updated_by := auth.uid();
    relationships_changed := new.client_id is distinct from old.client_id
      or new.client_unit_id is distinct from old.client_unit_id;

    valid_execution_transition :=
      (old.status = 'confirmed'::public.trip_status and new.status = 'traveling'::public.trip_status)
      or (old.status = 'traveling'::public.trip_status and new.status = 'at_client'::public.trip_status)
      or (old.status = 'at_client'::public.trip_status and new.status = 'in_service'::public.trip_status)
      or (old.status = 'in_service'::public.trip_status and new.status = 'returning'::public.trip_status)
      or (old.status = 'returning'::public.trip_status and new.status = 'finished'::public.trip_status);

    if old.status = 'finished'::public.trip_status then
      raise exception using errcode = 'P0001', message = 'trip_already_finished';
    elsif old.status = 'canceled'::public.trip_status then
      if new.status <> 'draft'::public.trip_status then
        raise exception using errcode = 'P0001', message = 'trip_canceled';
      end if;
      if old.confirmed_at is not null then
        raise exception using errcode = 'P0001', message = 'trip_confirmed_restore_forbidden';
      end if;
      if not private.has_organization_role(old.organization_id, array['admin']::public.organization_role[]) then
        raise exception using errcode = 'P0001', message = 'trip_restore_forbidden';
      end if;
      new.cancellation_reason := null; new.canceled_at := null; new.canceled_by := null;
    elsif new.status = 'canceled'::public.trip_status then
      if old.status not in (
        'draft'::public.trip_status, 'planned'::public.trip_status,
        'confirmed'::public.trip_status, 'traveling'::public.trip_status,
        'at_client'::public.trip_status, 'in_service'::public.trip_status,
        'returning'::public.trip_status
      ) or new.cancellation_reason is null
        or char_length(btrim(new.cancellation_reason)) < 5 then
        raise exception using errcode = 'P0001', message = 'trip_cancellation_reason_required';
      end if;
      new.cancellation_reason := btrim(new.cancellation_reason);
      new.canceled_at := now(); new.canceled_by := auth.uid();
    elsif not (
      new.status = old.status
      or valid_execution_transition
      or (old.status = 'draft'::public.trip_status and new.status = 'planned'::public.trip_status)
      or (old.status = 'planned'::public.trip_status and new.status = 'draft'::public.trip_status)
      or (old.status = 'planned'::public.trip_status and new.status = 'confirmed'::public.trip_status)
    ) then
      raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
    elsif old.status in (
      'confirmed'::public.trip_status, 'traveling'::public.trip_status,
      'at_client'::public.trip_status, 'in_service'::public.trip_status,
      'returning'::public.trip_status
    ) and new.status = old.status then
      raise exception using errcode = 'P0001', message = 'trip_not_editable';
    else
      new.cancellation_reason := null; new.canceled_at := null; new.canceled_by := null;
    end if;

    if old.status = 'planned'::public.trip_status and new.status = 'confirmed'::public.trip_status then
      new.confirmed_at := now(); new.confirmed_by := auth.uid();
    elsif new.confirmed_at is distinct from old.confirmed_at
      or new.confirmed_by is distinct from old.confirmed_by then
      raise exception using errcode = 'P0001', message = 'trip_immutable_fields';
    end if;

    if old.status = 'returning'::public.trip_status and new.status = 'finished'::public.trip_status then
      new.finished_at := now(); new.finished_by := auth.uid();
    elsif new.finished_at is distinct from old.finished_at
      or new.finished_by is distinct from old.finished_by then
      raise exception using errcode = 'P0001', message = 'trip_immutable_fields';
    end if;
  end if;

  if relationships_changed then
    select coalesce(nullif(client.trade_name, ''), client.legal_name),
      client.legal_name, client.trade_name, unit.name, unit.city, unit.state
    into client_display_name, client_legal_name, client_trade_name,
      unit_name, unit_city, unit_state
    from public.clients client
    join public.client_units unit on unit.organization_id = client.organization_id
      and unit.client_id = client.id
    where client.organization_id = new.organization_id and client.id = new.client_id
      and unit.id = new.client_unit_id and client.active and unit.active;
    if not found then raise exception using errcode = 'P0001', message = 'trip_unit_not_available'; end if;
    new.client_name_snapshot := client_display_name;
    new.client_legal_name_snapshot := client_legal_name;
    new.client_trade_name_snapshot := client_trade_name;
    new.client_unit_name_snapshot := unit_name;
    if new.destination_city is null then new.destination_city := unit_city; end if;
    if new.destination_state is null then new.destination_state := unit_state; end if;
  else
    new.client_name_snapshot := old.client_name_snapshot;
    new.client_legal_name_snapshot := old.client_legal_name_snapshot;
    new.client_trade_name_snapshot := old.client_trade_name_snapshot;
    new.client_unit_name_snapshot := old.client_unit_name_snapshot;
  end if;

  if tg_op = 'INSERT' or new.service_type_id is distinct from old.service_type_id then
    if not private.is_active_trip_service_type(new.organization_id, new.service_type_id) then
      raise exception using errcode = 'P0001', message = 'trip_service_type_not_available';
    end if;
  end if;
  if new.status in ('planned'::public.trip_status, 'confirmed'::public.trip_status)
    and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    if not private.is_active_trip_client_unit(new.organization_id, new.client_id, new.client_unit_id) then
      raise exception using errcode = 'P0001', message = 'trip_unit_not_available';
    end if;
    if new.service_type_id is null or not private.is_active_trip_service_type(new.organization_id, new.service_type_id) then
      raise exception using errcode = 'P0001', message = 'trip_service_type_not_available';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.record_trip_status_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare status_note text;
begin
  if old.status is distinct from new.status then
    status_note := nullif(btrim(current_setting('app.trip_status_note', true)), '');
    insert into public.trip_status_history (
      organization_id, trip_id, from_status, to_status, changed_by, note
    ) values (
      new.organization_id, new.id, old.status, new.status, auth.uid(),
      case when new.status = 'canceled'::public.trip_status
        then coalesce(status_note, new.cancellation_reason) else status_note end
    );
  end if;
  return new;
end;
$$;

create trigger trips_record_status_change
after update of status on public.trips
for each row execute function private.record_trip_status_change();

create or replace function private.sync_trip_technician_schedule()
returns trigger language plpgsql security definer set search_path = '' as $$
declare should_block boolean;
begin
  should_block := new.status in (
    'planned'::public.trip_status, 'confirmed'::public.trip_status,
    'traveling'::public.trip_status, 'at_client'::public.trip_status,
    'in_service'::public.trip_status, 'returning'::public.trip_status
  );
  update public.trip_technicians
  set occupancy_starts_at = new.travel_starts_at,
      occupancy_ends_at = new.travel_ends_at,
      blocks_schedule = should_block,
      updated_by = auth.uid()
  where organization_id = new.organization_id and trip_id = new.id
    and (occupancy_starts_at is distinct from new.travel_starts_at
      or occupancy_ends_at is distinct from new.travel_ends_at
      or blocks_schedule is distinct from should_block);
  return new;
end;
$$;

create or replace function private.sync_trip_vehicle_schedule()
returns trigger language plpgsql security definer set search_path = '' as $$
declare should_block boolean;
begin
  should_block := new.status in (
    'planned'::public.trip_status, 'confirmed'::public.trip_status,
    'traveling'::public.trip_status, 'at_client'::public.trip_status,
    'in_service'::public.trip_status, 'returning'::public.trip_status
  );
  update public.trip_vehicle_assignments
  set occupancy_starts_at = new.travel_starts_at,
      occupancy_ends_at = new.travel_ends_at,
      blocks_schedule = should_block,
      updated_by = auth.uid()
  where organization_id = new.organization_id and trip_id = new.id
    and (occupancy_starts_at is distinct from new.travel_starts_at
      or occupancy_ends_at is distinct from new.travel_ends_at
      or blocks_schedule is distinct from should_block);
  return new;
end;
$$;

create or replace function private.validate_trip_technician_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_status public.trip_status;
  current_starts_at timestamptz;
  current_ends_at timestamptz;
  technician_is_active boolean;
begin
  select status, travel_starts_at, travel_ends_at
  into current_status, current_starts_at, current_ends_at
  from public.trips
  where organization_id = new.organization_id and id = new.trip_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'trip_not_editable'; end if;

  if current_status in ('canceled'::public.trip_status, 'finished'::public.trip_status)
    and tg_op = 'UPDATE'
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
  if not private.has_organization_role(
    new.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_not_editable'; end if;
  if current_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
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
  ) then raise exception using errcode = 'P0001', message = 'trip_staffing_immutable_fields'; end if;

  perform private.lock_technician_schedule(new.organization_id, new.technician_id);
  select active into technician_is_active from public.technicians
  where organization_id = new.organization_id and id = new.technician_id;
  if technician_is_active is null
    or ((tg_op = 'INSERT' or (not old.is_responsible and new.is_responsible))
      and not technician_is_active) then
    raise exception using errcode = 'P0001', message = 'trip_technician_not_available';
  end if;
  if tg_op = 'INSERT' or (not old.is_responsible and new.is_responsible) then
    if private.technician_has_unavailability(
      new.organization_id, new.technician_id, current_starts_at, current_ends_at
    ) then raise exception using errcode = 'P0001', message = 'trip_technician_unavailable'; end if;
    if private.technician_has_trip_conflict(
      new.organization_id, new.technician_id, new.trip_id,
      current_starts_at, current_ends_at
    ) then raise exception using errcode = 'P0001', message = 'trip_technician_schedule_conflict'; end if;
  end if;
  new.occupancy_starts_at := current_starts_at;
  new.occupancy_ends_at := current_ends_at;
  new.blocks_schedule := current_status = 'planned'::public.trip_status;
  if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

create or replace function private.validate_trip_vehicle_assignment_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  current_status public.trip_status;
  current_starts_at timestamptz;
  current_ends_at timestamptz;
  target_vehicle_id uuid;
begin
  select status, travel_starts_at, travel_ends_at
  into current_status, current_starts_at, current_ends_at from public.trips
  where organization_id = new.organization_id and id = new.trip_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'trip_transport_not_editable'; end if;

  if current_status in ('canceled'::public.trip_status, 'finished'::public.trip_status)
    and tg_op = 'UPDATE'
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
  if not private.has_organization_role(
    new.organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_transport_not_editable'; end if;
  if current_status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_transport_not_editable';
  end if;
  if tg_op = 'UPDATE' and (
    new.organization_id is distinct from old.organization_id
    or new.trip_id is distinct from old.trip_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then raise exception using errcode = 'P0001', message = 'trip_transport_immutable_fields'; end if;

  for target_vehicle_id in select vehicle_id from (
    select new.vehicle_id union select old.vehicle_id where tg_op = 'UPDATE'
  ) vehicles order by vehicle_id loop
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

create or replace function public.transition_trip_status(
  p_organization_id uuid,
  p_trip_id uuid,
  p_target_status public.trip_status,
  p_note text default null
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  current_status public.trip_status;
  normalized_note text := nullif(btrim(p_note), '');
  authorized boolean;
begin
  if auth.uid() is null then
    raise exception using errcode = 'P0001', message = 'trip_transition_not_authorized';
  end if;
  if normalized_note is not null and (
    char_length(normalized_note) > 1000 or normalized_note ~ '[<>]'
  ) then raise exception using errcode = 'P0001', message = 'trip_transition_note_invalid'; end if;

  select status into current_status from public.trips
  where organization_id = p_organization_id and id = p_trip_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'trip_transition_not_found'; end if;

  authorized := private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) or private.is_trip_responsible_user(p_organization_id, p_trip_id);
  if not authorized then raise exception using errcode = 'P0001', message = 'trip_transition_not_authorized'; end if;

  if current_status = 'finished'::public.trip_status then
    raise exception using errcode = 'P0001', message = 'trip_already_finished';
  elsif current_status = 'canceled'::public.trip_status then
    raise exception using errcode = 'P0001', message = 'trip_canceled';
  elsif not (
    (current_status = 'confirmed'::public.trip_status and p_target_status = 'traveling'::public.trip_status)
    or (current_status = 'traveling'::public.trip_status and p_target_status = 'at_client'::public.trip_status)
    or (current_status = 'at_client'::public.trip_status and p_target_status = 'in_service'::public.trip_status)
    or (current_status = 'in_service'::public.trip_status and p_target_status = 'returning'::public.trip_status)
    or (current_status = 'returning'::public.trip_status and p_target_status = 'finished'::public.trip_status)
  ) then raise exception using errcode = 'P0001', message = 'trip_invalid_transition'; end if;

  perform set_config('app.trip_status_note', coalesce(normalized_note, ''), true);
  update public.trips set status = p_target_status, updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id and status = current_status;
  if not found then raise exception using errcode = 'P0001', message = 'trip_status_changed'; end if;
  return true;
end;
$$;

create or replace function public.cancel_trip(
  p_organization_id uuid, p_trip_id uuid, p_cancellation_reason text
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare current_status public.trip_status; normalized_reason text := btrim(p_cancellation_reason);
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_invalid_transition'; end if;
  if normalized_reason is null or char_length(normalized_reason) not between 5 and 500 then
    raise exception using errcode = 'P0001', message = 'trip_cancellation_reason_required';
  end if;
  select status into current_status from public.trips
  where organization_id = p_organization_id and id = p_trip_id for update;
  if not found or current_status not in (
    'draft'::public.trip_status, 'planned'::public.trip_status,
    'confirmed'::public.trip_status, 'traveling'::public.trip_status,
    'at_client'::public.trip_status, 'in_service'::public.trip_status,
    'returning'::public.trip_status
  ) then return false; end if;
  perform set_config('app.trip_status_note', normalized_reason, true);
  update public.trips set status = 'canceled', cancellation_reason = normalized_reason,
    updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id and status = current_status;
  return found;
end;
$$;

create or replace function public.list_trip_status_history(
  p_organization_id uuid,
  p_trip_id uuid
)
returns table (
  id uuid,
  from_status public.trip_status,
  to_status public.trip_status,
  occurred_at timestamptz,
  changed_by uuid,
  changed_by_name text,
  note text
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.can_view_trip_execution(p_organization_id, p_trip_id) then
    raise exception using errcode = 'P0001', message = 'trip_transition_not_found';
  end if;
  return query
    select history.id, history.from_status, history.to_status, history.occurred_at,
      history.changed_by, coalesce(profile.name, 'Usuário da organização'), history.note
    from public.trip_status_history history
    left join public.profiles profile on profile.id = history.changed_by
    where history.organization_id = p_organization_id and history.trip_id = p_trip_id
    order by history.occurred_at, history.id;
end;
$$;

insert into public.trip_status_history (
  organization_id, trip_id, from_status, to_status, occurred_at, changed_by
)
select trip.organization_id, trip.id, 'planned'::public.trip_status,
  'confirmed'::public.trip_status, trip.confirmed_at, trip.confirmed_by
from public.trips trip
where trip.confirmed_at is not null and trip.confirmed_by is not null
  and not exists (
    select 1 from public.trip_status_history history
    where history.organization_id = trip.organization_id and history.trip_id = trip.id
      and history.to_status = 'confirmed'::public.trip_status
  );

revoke all on public.trip_status_history from public, anon;
revoke insert, update, delete on public.trip_status_history from authenticated;
revoke all on function public.transition_trip_status(uuid, uuid, public.trip_status, text) from public, anon, authenticated;
revoke all on function public.list_trip_status_history(uuid, uuid) from public, anon, authenticated;
grant execute on function public.transition_trip_status(uuid, uuid, public.trip_status, text) to authenticated;
grant execute on function public.list_trip_status_history(uuid, uuid) to authenticated;

comment on table public.trip_status_history is 'Histórico append-only das transições de status das viagens.';
comment on function public.transition_trip_status(uuid, uuid, public.trip_status, text) is 'Executa a próxima transição operacional válida de uma viagem.';
