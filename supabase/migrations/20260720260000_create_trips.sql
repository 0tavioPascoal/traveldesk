create type public.trip_priority as enum ('low', 'normal', 'high', 'urgent');
create type public.trip_status as enum ('draft', 'planned', 'canceled');

alter table public.client_units
  add constraint client_units_organization_client_id_key
  unique (organization_id, client_id, id);

alter table public.service_types
  add constraint service_types_organization_id_id_key
  unique (organization_id, id);

create sequence public.trip_code_sequence;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  code text not null,
  client_id uuid not null,
  client_unit_id uuid not null,
  service_type_id uuid,
  client_name_snapshot text not null,
  client_legal_name_snapshot text not null,
  client_trade_name_snapshot text,
  client_unit_name_snapshot text not null,
  title text not null,
  reason text,
  description text,
  priority public.trip_priority not null default 'normal',
  status public.trip_status not null default 'draft',
  travel_starts_at timestamptz,
  travel_ends_at timestamptz,
  service_starts_at timestamptz,
  service_ends_at timestamptz,
  origin_city text,
  origin_state text,
  destination_city text,
  destination_state text,
  notes text,
  cancellation_reason text,
  canceled_at timestamptz,
  canceled_by uuid,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_organization_fkey
    foreign key (organization_id) references public.organizations (id) on delete restrict,
  constraint trips_client_fkey
    foreign key (organization_id, client_id)
    references public.clients (organization_id, id) on delete restrict,
  constraint trips_client_unit_fkey
    foreign key (organization_id, client_id, client_unit_id)
    references public.client_units (organization_id, client_id, id) on delete restrict,
  constraint trips_service_type_fkey
    foreign key (organization_id, service_type_id)
    references public.service_types (organization_id, id) on delete restrict,
  constraint trips_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint trips_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint trips_canceled_by_fkey
    foreign key (canceled_by) references public.profiles (id) on delete restrict,
  constraint trips_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trips_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trips_canceled_by_membership_fkey
    foreign key (organization_id, canceled_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trips_organization_id_id_key unique (organization_id, id),
  constraint trips_organization_code_key unique (organization_id, code),
  constraint trips_code_format check (code ~ '^VGM-[0-9]{4}-[0-9]{6,}$'),
  constraint trips_client_name_snapshot_format check (
    client_name_snapshot = btrim(client_name_snapshot)
    and char_length(client_name_snapshot) between 2 and 200
  ),
  constraint trips_client_legal_name_snapshot_format check (
    client_legal_name_snapshot = btrim(client_legal_name_snapshot)
    and char_length(client_legal_name_snapshot) between 2 and 200
  ),
  constraint trips_client_trade_name_snapshot_format check (
    client_trade_name_snapshot is null or (
      client_trade_name_snapshot = btrim(client_trade_name_snapshot)
      and char_length(client_trade_name_snapshot) between 1 and 160
    )
  ),
  constraint trips_client_unit_name_snapshot_format check (
    client_unit_name_snapshot = btrim(client_unit_name_snapshot)
    and char_length(client_unit_name_snapshot) between 2 and 160
  ),
  constraint trips_title_format check (
    title = btrim(title) and char_length(title) between 3 and 200
  ),
  constraint trips_reason_format check (
    reason is null or (reason = btrim(reason) and char_length(reason) between 1 and 500)
  ),
  constraint trips_description_format check (
    description is null or (
      description = btrim(description) and char_length(description) between 1 and 5000
    )
  ),
  constraint trips_notes_format check (
    notes is null or (notes = btrim(notes) and char_length(notes) between 1 and 3000)
  ),
  constraint trips_origin_format check (
    (origin_city is null and origin_state is null)
    or (
      origin_city = btrim(origin_city)
      and char_length(origin_city) between 2 and 120
      and origin_state ~ '^[A-Z]{2}$'
    )
  ),
  constraint trips_destination_format check (
    (destination_city is null and destination_state is null)
    or (
      destination_city = btrim(destination_city)
      and char_length(destination_city) between 2 and 120
      and destination_state ~ '^[A-Z]{2}$'
    )
  ),
  constraint trips_travel_period_pair check (
    (travel_starts_at is null) = (travel_ends_at is null)
  ),
  constraint trips_travel_period_order check (
    travel_starts_at is null or travel_ends_at > travel_starts_at
  ),
  constraint trips_service_period_pair check (
    (service_starts_at is null) = (service_ends_at is null)
  ),
  constraint trips_service_period_order check (
    service_starts_at is null or service_ends_at > service_starts_at
  ),
  constraint trips_service_period_containment check (
    service_starts_at is null
    or (
      travel_starts_at is not null
      and travel_starts_at <= service_starts_at
      and service_ends_at <= travel_ends_at
    )
  ),
  constraint trips_planned_is_complete check (
    status <> 'planned'::public.trip_status
    or (
      service_type_id is not null
      and travel_starts_at is not null and travel_ends_at is not null
      and service_starts_at is not null and service_ends_at is not null
      and origin_city is not null and origin_state is not null
      and destination_city is not null and destination_state is not null
    )
  ),
  constraint trips_cancellation_state check (
    (
      status = 'canceled'::public.trip_status
      and cancellation_reason is not null
      and canceled_at is not null
      and canceled_by is not null
    ) or (
      status <> 'canceled'::public.trip_status
      and cancellation_reason is null
      and canceled_at is null
      and canceled_by is null
    )
  ),
  constraint trips_cancellation_reason_format check (
    cancellation_reason is null or (
      cancellation_reason = btrim(cancellation_reason)
      and char_length(cancellation_reason) between 5 and 500
    )
  )
);

create index trips_organization_status_travel_starts_idx
  on public.trips (organization_id, status, travel_starts_at);
create index trips_organization_priority_travel_starts_idx
  on public.trips (organization_id, priority, travel_starts_at);
create index trips_organization_travel_ends_idx
  on public.trips (organization_id, travel_ends_at);
create index trips_organization_client_starts_idx
  on public.trips (organization_id, client_id, travel_starts_at);
create index trips_organization_client_unit_idx
  on public.trips (organization_id, client_unit_id);
create index trips_organization_service_type_idx
  on public.trips (organization_id, service_type_id);

create trigger trips_set_updated_at
before update on public.trips
for each row execute function private.set_updated_at();

create function private.is_active_trip_client_unit(
  target_organization_id uuid,
  target_client_id uuid,
  target_unit_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.clients client
    join public.client_units unit
      on unit.organization_id = client.organization_id
      and unit.client_id = client.id
    where client.organization_id = target_organization_id
      and client.id = target_client_id
      and unit.id = target_unit_id
      and client.active
      and unit.active
  );
$$;

create function private.is_active_trip_service_type(
  target_organization_id uuid,
  target_service_type_id uuid
)
returns boolean language sql stable security definer set search_path = '' as $$
  select target_service_type_id is null or exists (
    select 1 from public.service_types
    where organization_id = target_organization_id
      and id = target_service_type_id
      and active
  );
$$;

create function private.validate_trip_write()
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
    if new.status = 'canceled'::public.trip_status then
      raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
    end if;
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
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
    new.updated_by := auth.uid();
    relationships_changed := new.client_id is distinct from old.client_id
      or new.client_unit_id is distinct from old.client_unit_id;

    if old.status = 'canceled'::public.trip_status then
      if new.status <> 'draft'::public.trip_status then
        raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
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
      if old.status not in ('draft'::public.trip_status, 'planned'::public.trip_status)
        or new.cancellation_reason is null
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
    ) then
      raise exception using errcode = 'P0001', message = 'trip_invalid_transition';
    else
      new.cancellation_reason := null;
      new.canceled_at := null;
      new.canceled_by := null;
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

  if new.status = 'planned'::public.trip_status
    and (tg_op = 'INSERT' or old.status <> 'planned'::public.trip_status) then
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

create trigger trips_validate_write
before insert or update on public.trips
for each row execute function private.validate_trip_write();

revoke all on sequence public.trip_code_sequence from public, anon, authenticated;
revoke all on function private.is_active_trip_client_unit(uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function private.is_active_trip_service_type(uuid, uuid)
  from public, anon, authenticated;
revoke all on function private.validate_trip_write()
  from public, anon, authenticated;
grant execute on function private.is_active_trip_client_unit(uuid, uuid, uuid)
  to authenticated;
grant execute on function private.is_active_trip_service_type(uuid, uuid)
  to authenticated;

revoke all on public.trips from anon, authenticated;
grant select on public.trips to authenticated;
grant insert (
  organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_legal_name_snapshot, client_trade_name_snapshot,
  client_unit_name_snapshot, title, reason, description,
  priority, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, notes, created_by, updated_by
) on public.trips to authenticated;
grant update (
  client_id, client_unit_id, service_type_id, title, reason, description,
  priority, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, notes, cancellation_reason, updated_by
) on public.trips to authenticated;
grant usage on type public.trip_priority to authenticated;
grant usage on type public.trip_status to authenticated;

alter table public.trips enable row level security;

create policy trips_select_administrative on public.trips
for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy trips_insert_administrative on public.trips
for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.is_active_trip_client_unit(
    organization_id, client_id, client_unit_id
  ))
  and (select private.is_active_trip_service_type(
    organization_id, service_type_id
  ))
);

create policy trips_update_administrative on public.trips
for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and updated_by = (select auth.uid())
);
