set search_path = public, extensions;

alter table public.trips
  add column confirmed_at timestamptz,
  add column confirmed_by uuid,
  add constraint trips_confirmed_by_fkey
    foreign key (confirmed_by) references public.profiles (id) on delete restrict,
  add constraint trips_confirmed_by_membership_fkey
    foreign key (organization_id, confirmed_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  add constraint trips_confirmation_pair check (
    (confirmed_at is null) = (confirmed_by is null)
  ),
  add constraint trips_confirmation_state check (
    (status = 'confirmed'::public.trip_status and confirmed_at is not null)
    or (status = 'canceled'::public.trip_status)
    or (status in ('draft'::public.trip_status, 'planned'::public.trip_status)
      and confirmed_at is null)
  ),
  add constraint trips_confirmed_is_complete check (
    status <> 'confirmed'::public.trip_status
    or (
      service_type_id is not null
      and travel_starts_at is not null and travel_ends_at is not null
      and service_starts_at is not null and service_ends_at is not null
      and origin_city is not null and origin_state is not null
      and destination_city is not null and destination_state is not null
    )
  );

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
begin
  if tg_op = 'INSERT' then
    if new.status in ('canceled'::public.trip_status, 'confirmed'::public.trip_status) then
      raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
    end if;
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
    new.confirmed_at := null;
    new.confirmed_by := null;
    new.cancellation_reason := null;
    new.canceled_at := null;
    new.canceled_by := null;
    select timezone into organization_timezone
    from public.organizations where id = new.organization_id;
    new.code := format(
      'VGM-%s-%s',
      extract(year from new.created_at at time zone organization_timezone)::integer,
      lpad(nextval('public.trip_code_sequence')::text, 6, '0')
    );
    relationships_changed := true;
  else
    if new.organization_id is distinct from old.organization_id
      or new.code is distinct from old.code
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at then
      raise exception using errcode = 'P0001', message = 'trip_immutable_fields';
    end if;
    if old.status = 'confirmed'::public.trip_status
      and new.status <> 'canceled'::public.trip_status then
      raise exception using errcode = 'P0001', message = 'trip_not_editable';
    end if;
    new.updated_by := auth.uid();
    relationships_changed := new.client_id is distinct from old.client_id
      or new.client_unit_id is distinct from old.client_unit_id;

    if old.status = 'canceled'::public.trip_status then
      if new.status <> 'draft'::public.trip_status then
        raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
      end if;
      if old.confirmed_at is not null then
        raise exception using errcode = 'P0001', message = 'trip_confirmed_restore_forbidden';
      end if;
      if not private.has_organization_role(
        old.organization_id, array['admin']::public.organization_role[]
      ) then
        raise exception using errcode = 'P0001', message = 'trip_restore_forbidden';
      end if;
      new.cancellation_reason := null;
      new.canceled_at := null;
      new.canceled_by := null;
    elsif new.status = 'canceled'::public.trip_status then
      if old.status not in (
        'draft'::public.trip_status,
        'planned'::public.trip_status,
        'confirmed'::public.trip_status
      ) or new.cancellation_reason is null
        or char_length(btrim(new.cancellation_reason)) < 5 then
        raise exception using errcode = 'P0001', message = 'trip_cancellation_reason_required';
      end if;
      new.cancellation_reason := btrim(new.cancellation_reason);
      new.canceled_at := now();
      new.canceled_by := auth.uid();
    elsif not (
      new.status = old.status
      or (old.status = 'draft'::public.trip_status and new.status = 'planned'::public.trip_status)
      or (old.status = 'planned'::public.trip_status and new.status = 'draft'::public.trip_status)
      or (old.status = 'planned'::public.trip_status and new.status = 'confirmed'::public.trip_status)
    ) then
      raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
    else
      new.cancellation_reason := null;
      new.canceled_at := null;
      new.canceled_by := null;
    end if;

    if old.status = 'planned'::public.trip_status
      and new.status = 'confirmed'::public.trip_status then
      new.confirmed_at := now();
      new.confirmed_by := auth.uid();
    elsif new.confirmed_at is distinct from old.confirmed_at
      or new.confirmed_by is distinct from old.confirmed_by then
      raise exception using errcode = 'P0001', message = 'trip_immutable_fields';
    end if;
  end if;

  if relationships_changed then
    select
      coalesce(nullif(client.trade_name, ''), client.legal_name),
      client.legal_name,
      client.trade_name,
      unit.name,
      unit.city,
      unit.state
    into client_display_name, client_legal_name, client_trade_name,
      unit_name, unit_city, unit_state
    from public.clients client
    join public.client_units unit
      on unit.organization_id = client.organization_id
      and unit.client_id = client.id
    where client.organization_id = new.organization_id
      and client.id = new.client_id
      and unit.id = new.client_unit_id
      and client.active
      and unit.active;
    if not found then
      raise exception using errcode = 'P0001', message = 'trip_unit_not_available';
    end if;
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

  if tg_op = 'INSERT'
    or new.service_type_id is distinct from old.service_type_id then
    if not private.is_active_trip_service_type(new.organization_id, new.service_type_id) then
      raise exception using errcode = 'P0001', message = 'trip_service_type_not_available';
    end if;
  end if;

  if new.status in ('planned'::public.trip_status, 'confirmed'::public.trip_status)
    and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    if not private.is_active_trip_client_unit(
      new.organization_id, new.client_id, new.client_unit_id
    ) then
      raise exception using errcode = 'P0001', message = 'trip_unit_not_available';
    end if;
    if new.service_type_id is null
      or not private.is_active_trip_service_type(
        new.organization_id, new.service_type_id
      ) then
      raise exception using errcode = 'P0001', message = 'trip_service_type_not_available';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.sync_trip_technician_schedule()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.trip_technicians
  set occupancy_starts_at = new.travel_starts_at,
      occupancy_ends_at = new.travel_ends_at,
      blocks_schedule = new.status in ('planned'::public.trip_status, 'confirmed'::public.trip_status),
      updated_by = auth.uid()
  where organization_id = new.organization_id and trip_id = new.id
    and (
      occupancy_starts_at is distinct from new.travel_starts_at
      or occupancy_ends_at is distinct from new.travel_ends_at
      or blocks_schedule is distinct from (
        new.status in ('planned'::public.trip_status, 'confirmed'::public.trip_status)
      )
    );
  return new;
end;
$$;

create or replace function private.sync_trip_vehicle_schedule()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.trip_vehicle_assignments
  set occupancy_starts_at = new.travel_starts_at,
      occupancy_ends_at = new.travel_ends_at,
      blocks_schedule = new.status in ('planned'::public.trip_status, 'confirmed'::public.trip_status),
      updated_by = auth.uid()
  where organization_id = new.organization_id and trip_id = new.id
    and (
      occupancy_starts_at is distinct from new.travel_starts_at
      or occupancy_ends_at is distinct from new.travel_ends_at
      or blocks_schedule is distinct from (
        new.status in ('planned'::public.trip_status, 'confirmed'::public.trip_status)
      )
    );
  return new;
end;
$$;

create function public.mark_trip_as_planned(p_organization_id uuid, p_trip_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_invalid_transition'; end if;
  update public.trips set status = 'planned', updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id and status = 'draft';
  return found;
end;
$$;

create function public.return_trip_to_draft(p_organization_id uuid, p_trip_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_invalid_transition'; end if;
  update public.trips set status = 'draft', updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id and status = 'planned';
  return found;
end;
$$;

create function public.cancel_trip(
  p_organization_id uuid, p_trip_id uuid, p_cancellation_reason text
)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_invalid_transition'; end if;
  if p_cancellation_reason is null
    or char_length(btrim(p_cancellation_reason)) not between 5 and 500 then
    raise exception using errcode = 'P0001', message = 'trip_cancellation_reason_required';
  end if;
  update public.trips
  set status = 'canceled', cancellation_reason = btrim(p_cancellation_reason), updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id
    and status in ('draft'::public.trip_status, 'planned'::public.trip_status, 'confirmed'::public.trip_status);
  return found;
end;
$$;

create function public.restore_canceled_trip(p_organization_id uuid, p_trip_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id, array['admin']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_restore_forbidden'; end if;
  if exists (
    select 1 from public.trips where organization_id = p_organization_id
      and id = p_trip_id and status = 'canceled' and confirmed_at is not null
  ) then raise exception using errcode = 'P0001', message = 'trip_confirmed_restore_forbidden'; end if;
  update public.trips set status = 'draft', updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id and status = 'canceled';
  return found;
end;
$$;

create function public.confirm_trip(p_organization_id uuid, p_trip_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  trip_record public.trips;
  team_count integer;
  responsible_count integer;
  technician_record record;
  assignment_record public.trip_vehicle_assignments;
  overnight_record public.trip_overnights;
  organization_timezone text;
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id, array['admin', 'coordinator']::public.organization_role[]
  ) then raise exception using errcode = 'P0001', message = 'trip_confirmation_not_found'; end if;

  select * into trip_record from public.trips
  where organization_id = p_organization_id and id = p_trip_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'trip_confirmation_not_found'; end if;
  if trip_record.status <> 'planned'::public.trip_status then
    raise exception using errcode = 'P0001', message = 'trip_confirmation_not_planned';
  end if;
  if trip_record.client_id is null or trip_record.client_unit_id is null
    or trip_record.service_type_id is null or char_length(btrim(trip_record.title)) < 3
    or trip_record.travel_starts_at is null or trip_record.travel_ends_at is null
    or trip_record.service_starts_at is null or trip_record.service_ends_at is null
    or trip_record.origin_city is null or trip_record.origin_state is null
    or trip_record.destination_city is null or trip_record.destination_state is null then
    raise exception using errcode = 'P0001', message = 'trip_confirmation_main_data_incomplete';
  end if;
  if trip_record.travel_ends_at <= trip_record.travel_starts_at
    or trip_record.service_ends_at <= trip_record.service_starts_at
    or trip_record.service_starts_at < trip_record.travel_starts_at
    or trip_record.service_ends_at > trip_record.travel_ends_at then
    raise exception using errcode = 'P0001', message = 'trip_confirmation_invalid_period';
  end if;

  perform 1 from public.clients where organization_id = p_organization_id
    and id = trip_record.client_id and active for share;
  if not found then raise exception using errcode = 'P0001', message = 'trip_confirmation_client_inactive'; end if;
  perform 1 from public.client_units where organization_id = p_organization_id
    and client_id = trip_record.client_id and id = trip_record.client_unit_id and active for share;
  if not found then raise exception using errcode = 'P0001', message = 'trip_confirmation_unit_inactive'; end if;
  perform 1 from public.service_types where organization_id = p_organization_id
    and id = trip_record.service_type_id and active for share;
  if not found then raise exception using errcode = 'P0001', message = 'trip_confirmation_service_type_inactive'; end if;

  select count(*)::integer, count(*) filter (where is_responsible)::integer
  into team_count, responsible_count from public.trip_technicians
  where organization_id = p_organization_id and trip_id = p_trip_id;
  if team_count = 0 then raise exception using errcode = 'P0001', message = 'trip_confirmation_team_required'; end if;
  if responsible_count <> 1 then raise exception using errcode = 'P0001', message = 'trip_confirmation_responsible_required'; end if;

  select * into assignment_record from public.trip_vehicle_assignments
  where organization_id = p_organization_id and trip_id = p_trip_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'trip_confirmation_transport_required'; end if;
  perform private.lock_vehicle_schedule(p_organization_id, assignment_record.vehicle_id);
  perform 1 from public.vehicles where organization_id = p_organization_id
    and id = assignment_record.vehicle_id for share;

  for technician_record in
    select allocation.technician_id, technician.active
    from public.trip_technicians allocation
    join public.technicians technician
      on technician.organization_id = allocation.organization_id
      and technician.id = allocation.technician_id
    where allocation.organization_id = p_organization_id and allocation.trip_id = p_trip_id
    order by allocation.technician_id
  loop
    perform private.lock_technician_schedule(p_organization_id, technician_record.technician_id);
    perform 1 from public.technicians where organization_id = p_organization_id
      and id = technician_record.technician_id for share;
    if not technician_record.active then
      raise exception using errcode = 'P0001', message = 'trip_confirmation_technician_inactive';
    end if;
    if private.technician_has_unavailability(
      p_organization_id, technician_record.technician_id,
      trip_record.travel_starts_at, trip_record.travel_ends_at
    ) then raise exception using errcode = 'P0001', message = 'trip_confirmation_technician_unavailable'; end if;
    if private.technician_has_trip_conflict(
      p_organization_id, technician_record.technician_id, p_trip_id,
      trip_record.travel_starts_at, trip_record.travel_ends_at
    ) then raise exception using errcode = 'P0001', message = 'trip_confirmation_technician_schedule_conflict'; end if;
  end loop;

  if exists (
    select 1 from public.trip_required_skills requirement
    where requirement.organization_id = p_organization_id and requirement.trip_id = p_trip_id
      and not exists (
        select 1 from public.trip_technicians allocation
        join public.technician_skills skill
          on skill.organization_id = allocation.organization_id
          and skill.technician_id = allocation.technician_id
        join public.technicians technician
          on technician.organization_id = allocation.organization_id
          and technician.id = allocation.technician_id
        where allocation.organization_id = p_organization_id and allocation.trip_id = p_trip_id
          and technician.active and skill.skill_id = requirement.skill_id
          and skill.proficiency_level >= requirement.minimum_proficiency_level
      )
  ) then raise exception using errcode = 'P0001', message = 'trip_confirmation_skill_coverage_incomplete'; end if;

  perform private.validate_trip_transport(
    p_organization_id, p_trip_id, assignment_record.vehicle_id,
    assignment_record.driver_technician_id,
    trip_record.travel_starts_at, trip_record.travel_ends_at
  );

  select timezone into organization_timezone from public.organizations
  where id = p_organization_id;
  select * into overnight_record from public.trip_overnights
  where organization_id = p_organization_id and trip_id = p_trip_id for update;
  if not found then raise exception using errcode = 'P0001', message = 'trip_confirmation_overnights_missing'; end if;
  if overnight_record.calculated_for_travel_starts_at is distinct from trip_record.travel_starts_at
    or overnight_record.calculated_for_travel_ends_at is distinct from trip_record.travel_ends_at
    or overnight_record.calculation_timezone is distinct from organization_timezone
    or overnight_record.calculated_overnights <> private.calculate_trip_overnights(
      trip_record.travel_starts_at, trip_record.travel_ends_at, organization_timezone
    ) then raise exception using errcode = 'P0001', message = 'trip_confirmation_overnights_outdated'; end if;
  if overnight_record.reviewed_at is null or overnight_record.reviewed_by is null then
    raise exception using errcode = 'P0001', message = 'trip_confirmation_overnights_not_reviewed';
  end if;

  update public.trips set status = 'confirmed', updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_trip_id and status = 'planned';
  return found;
end;
$$;

revoke update (status, cancellation_reason) on public.trips from authenticated;

revoke all on function public.mark_trip_as_planned(uuid, uuid) from public, anon, authenticated;
revoke all on function public.return_trip_to_draft(uuid, uuid) from public, anon, authenticated;
revoke all on function public.cancel_trip(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.restore_canceled_trip(uuid, uuid) from public, anon, authenticated;
revoke all on function public.confirm_trip(uuid, uuid) from public, anon, authenticated;
grant execute on function public.mark_trip_as_planned(uuid, uuid) to authenticated;
grant execute on function public.return_trip_to_draft(uuid, uuid) to authenticated;
grant execute on function public.cancel_trip(uuid, uuid, text) to authenticated;
grant execute on function public.restore_canceled_trip(uuid, uuid) to authenticated;
grant execute on function public.confirm_trip(uuid, uuid) to authenticated;

comment on column public.trips.confirmed_at is 'Momento em que o planejamento tornou-se programação operacional.';
comment on column public.trips.confirmed_by is 'Usuário que confirmou a viagem.';
comment on function public.confirm_trip(uuid, uuid) is 'Confirma atomicamente uma viagem após revalidar planejamento, recursos e pernoites.';
