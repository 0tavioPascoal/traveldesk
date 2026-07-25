set search_path = public, extensions;

do $$
begin
  if exists (
    select 1
    from public.organizations organization
    where not exists (
      select 1
      from pg_catalog.pg_timezone_names timezone
      where timezone.name = organization.timezone
    )
  ) then
    raise exception using errcode = 'P0001', message = 'trip_overnight_invalid_timezone';
  end if;
end;
$$;

create table public.trip_overnights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  trip_id uuid not null,
  calculated_overnights integer not null,
  adjusted_overnights integer,
  adjustment_reason text,
  calculated_for_travel_starts_at timestamptz not null,
  calculated_for_travel_ends_at timestamptz not null,
  calculation_timezone text not null,
  reviewed_by uuid,
  reviewed_at timestamptz,
  adjusted_by uuid,
  adjusted_at timestamptz,
  revision bigint not null default 1,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_overnights_trip_fkey
    foreign key (organization_id, trip_id)
    references public.trips (organization_id, id) on delete restrict,
  constraint trip_overnights_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint trip_overnights_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint trip_overnights_reviewed_by_fkey
    foreign key (reviewed_by) references public.profiles (id) on delete restrict,
  constraint trip_overnights_adjusted_by_fkey
    foreign key (adjusted_by) references public.profiles (id) on delete restrict,
  constraint trip_overnights_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_overnights_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_overnights_reviewed_by_membership_fkey
    foreign key (organization_id, reviewed_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_overnights_adjusted_by_membership_fkey
    foreign key (organization_id, adjusted_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint trip_overnights_organization_id_id_key unique (organization_id, id),
  constraint trip_overnights_trip_key unique (organization_id, trip_id),
  constraint trip_overnights_calculated_nonnegative check (calculated_overnights >= 0),
  constraint trip_overnights_adjusted_range check (
    adjusted_overnights is null or adjusted_overnights between 0 and 3650
  ),
  constraint trip_overnights_adjustment_is_override check (
    adjusted_overnights is null or adjusted_overnights <> calculated_overnights
  ),
  constraint trip_overnights_adjustment_state check (
    (
      adjusted_overnights is null
      and adjustment_reason is null
      and adjusted_by is null
      and adjusted_at is null
    ) or (
      adjusted_overnights is not null
      and adjustment_reason = btrim(adjustment_reason)
      and char_length(adjustment_reason) between 5 and 1000
      and adjusted_by is not null
      and adjusted_at is not null
    )
  ),
  constraint trip_overnights_review_state check (
    (reviewed_by is null) = (reviewed_at is null)
  ),
  constraint trip_overnights_calculation_period_order check (
    calculated_for_travel_ends_at > calculated_for_travel_starts_at
  ),
  constraint trip_overnights_timezone_not_blank check (btrim(calculation_timezone) <> ''),
  constraint trip_overnights_revision_positive check (revision >= 1)
);

create trigger trip_overnights_set_updated_at
before update on public.trip_overnights
for each row execute function private.set_updated_at();

create function private.calculate_trip_overnights(
  target_starts_at timestamptz,
  target_ends_at timestamptz,
  target_timezone text
)
returns integer
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if target_starts_at is null or target_ends_at is null
    or target_ends_at <= target_starts_at then
    raise exception using errcode = 'P0001', message = 'trip_overnight_period_required';
  end if;
  if not exists (
    select 1 from pg_catalog.pg_timezone_names where name = target_timezone
  ) then
    raise exception using errcode = 'P0001', message = 'trip_overnight_invalid_timezone';
  end if;
  return greatest(
    0,
    (target_ends_at at time zone target_timezone)::date
      - (target_starts_at at time zone target_timezone)::date
  );
end;
$$;

create function private.sync_trip_overnights()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  organization_timezone text;
  calculated integer;
  should_recalculate boolean;
  restored boolean;
begin
  if tg_op = 'INSERT' then
    restored := false;
    should_recalculate := true;
  else
    restored := old.status = 'canceled'::public.trip_status
      and new.status = 'draft'::public.trip_status;
    should_recalculate := new.travel_starts_at is distinct from old.travel_starts_at
      or new.travel_ends_at is distinct from old.travel_ends_at
      or restored;
  end if;

  if not should_recalculate then return null; end if;

  if new.travel_starts_at is null or new.travel_ends_at is null then
    update public.trip_overnights
    set adjusted_overnights = null,
        adjustment_reason = null,
        adjusted_by = null,
        adjusted_at = null,
        reviewed_by = null,
        reviewed_at = null,
        revision = revision + 1,
        updated_by = new.updated_by
    where organization_id = new.organization_id and trip_id = new.id;
    return null;
  end if;

  select timezone into organization_timezone
  from public.organizations where id = new.organization_id;
  calculated := private.calculate_trip_overnights(
    new.travel_starts_at, new.travel_ends_at, organization_timezone
  );

  insert into public.trip_overnights (
    organization_id, trip_id, calculated_overnights,
    calculated_for_travel_starts_at, calculated_for_travel_ends_at,
    calculation_timezone, created_by, updated_by
  ) values (
    new.organization_id, new.id, calculated,
    new.travel_starts_at, new.travel_ends_at,
    organization_timezone, new.created_by, new.updated_by
  )
  on conflict (organization_id, trip_id) do update
  set calculated_overnights = excluded.calculated_overnights,
      adjusted_overnights = null,
      adjustment_reason = null,
      calculated_for_travel_starts_at = excluded.calculated_for_travel_starts_at,
      calculated_for_travel_ends_at = excluded.calculated_for_travel_ends_at,
      calculation_timezone = excluded.calculation_timezone,
      reviewed_by = null,
      reviewed_at = null,
      adjusted_by = null,
      adjusted_at = null,
      revision = public.trip_overnights.revision + 1,
      updated_by = excluded.updated_by;
  return null;
end;
$$;

create trigger trips_sync_overnights
after insert or update of travel_starts_at, travel_ends_at, status on public.trips
for each row execute function private.sync_trip_overnights();

insert into public.trip_overnights (
  organization_id, trip_id, calculated_overnights,
  calculated_for_travel_starts_at, calculated_for_travel_ends_at,
  calculation_timezone, created_by, updated_by
)
select
  trip.organization_id,
  trip.id,
  private.calculate_trip_overnights(
    trip.travel_starts_at, trip.travel_ends_at, organization.timezone
  ),
  trip.travel_starts_at,
  trip.travel_ends_at,
  organization.timezone,
  trip.created_by,
  trip.updated_by
from public.trips trip
join public.organizations organization on organization.id = trip.organization_id
where trip.travel_starts_at is not null and trip.travel_ends_at is not null
on conflict (organization_id, trip_id) do nothing;

create function private.lock_editable_trip_overnight(
  target_organization_id uuid,
  target_trip_id uuid,
  expected_revision bigint
)
returns public.trip_overnights
language plpgsql
security definer
set search_path = ''
as $$
declare
  trip_record public.trips;
  overnight_record public.trip_overnights;
  organization_timezone text;
  current_calculated integer;
begin
  if auth.uid() is null or not private.has_organization_role(
    target_organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_editable';
  end if;

  select * into trip_record from public.trips
  where organization_id = target_organization_id and id = target_trip_id
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_found';
  end if;
  if trip_record.status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_editable';
  end if;
  if trip_record.travel_starts_at is null or trip_record.travel_ends_at is null then
    raise exception using errcode = 'P0001', message = 'trip_overnight_period_required';
  end if;

  select timezone into organization_timezone
  from public.organizations where id = target_organization_id;
  current_calculated := private.calculate_trip_overnights(
    trip_record.travel_starts_at, trip_record.travel_ends_at, organization_timezone
  );

  select * into overnight_record from public.trip_overnights
  where organization_id = target_organization_id and trip_id = target_trip_id
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_calculated';
  end if;
  if overnight_record.revision <> expected_revision
    or overnight_record.calculated_for_travel_starts_at is distinct from trip_record.travel_starts_at
    or overnight_record.calculated_for_travel_ends_at is distinct from trip_record.travel_ends_at
    or overnight_record.calculation_timezone is distinct from organization_timezone
    or overnight_record.calculated_overnights <> current_calculated then
    raise exception using errcode = 'P0001', message = 'trip_overnight_stale';
  end if;
  return overnight_record;
end;
$$;

create function public.ensure_trip_overnight_calculation(
  p_organization_id uuid,
  p_trip_id uuid
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  trip_record public.trips;
  organization_timezone text;
  calculated integer;
  resulting_revision bigint;
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_editable';
  end if;
  select * into trip_record from public.trips
  where organization_id = p_organization_id and id = p_trip_id
  for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_found';
  end if;
  if trip_record.status not in ('draft'::public.trip_status, 'planned'::public.trip_status) then
    raise exception using errcode = 'P0001', message = 'trip_overnight_not_editable';
  end if;
  select timezone into organization_timezone
  from public.organizations where id = p_organization_id;
  calculated := private.calculate_trip_overnights(
    trip_record.travel_starts_at, trip_record.travel_ends_at, organization_timezone
  );
  insert into public.trip_overnights (
    organization_id, trip_id, calculated_overnights,
    calculated_for_travel_starts_at, calculated_for_travel_ends_at,
    calculation_timezone, created_by, updated_by
  ) values (
    p_organization_id, p_trip_id, calculated,
    trip_record.travel_starts_at, trip_record.travel_ends_at,
    organization_timezone, auth.uid(), auth.uid()
  )
  on conflict (organization_id, trip_id) do update
  set calculated_overnights = excluded.calculated_overnights,
      adjusted_overnights = null,
      adjustment_reason = null,
      calculated_for_travel_starts_at = excluded.calculated_for_travel_starts_at,
      calculated_for_travel_ends_at = excluded.calculated_for_travel_ends_at,
      calculation_timezone = excluded.calculation_timezone,
      reviewed_by = null,
      reviewed_at = null,
      adjusted_by = null,
      adjusted_at = null,
      revision = public.trip_overnights.revision + 1,
      updated_by = auth.uid()
  returning revision into resulting_revision;
  return resulting_revision;
end;
$$;

create function public.review_trip_overnights(
  p_organization_id uuid,
  p_trip_id uuid,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.lock_editable_trip_overnight(
    p_organization_id, p_trip_id, p_expected_revision
  );
  update public.trip_overnights
  set reviewed_by = auth.uid(), reviewed_at = now(),
      updated_by = auth.uid(), revision = revision + 1
  where organization_id = p_organization_id and trip_id = p_trip_id;
  return found;
end;
$$;

create function public.adjust_trip_overnights(
  p_organization_id uuid,
  p_trip_id uuid,
  p_adjusted_overnights integer,
  p_adjustment_reason text,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  overnight_record public.trip_overnights;
  normalized_reason text := nullif(btrim(p_adjustment_reason), '');
begin
  overnight_record := private.lock_editable_trip_overnight(
    p_organization_id, p_trip_id, p_expected_revision
  );
  if p_adjusted_overnights is null or p_adjusted_overnights < 0
    or p_adjusted_overnights > 3650 then
    raise exception using errcode = 'P0001', message = 'trip_overnight_invalid_adjustment';
  end if;
  if p_adjusted_overnights = overnight_record.calculated_overnights then
    update public.trip_overnights
    set adjusted_overnights = null, adjustment_reason = null,
        adjusted_by = null, adjusted_at = null,
        reviewed_by = auth.uid(), reviewed_at = now(),
        updated_by = auth.uid(), revision = revision + 1
    where organization_id = p_organization_id and trip_id = p_trip_id;
    return found;
  end if;
  if normalized_reason is null or char_length(normalized_reason) not between 5 and 1000 then
    raise exception using errcode = 'P0001', message = 'trip_overnight_adjustment_reason_required';
  end if;
  update public.trip_overnights
  set adjusted_overnights = p_adjusted_overnights,
      adjustment_reason = normalized_reason,
      adjusted_by = auth.uid(), adjusted_at = now(),
      reviewed_by = auth.uid(), reviewed_at = now(),
      updated_by = auth.uid(), revision = revision + 1
  where organization_id = p_organization_id and trip_id = p_trip_id;
  return found;
end;
$$;

create function public.reset_trip_overnight_adjustment(
  p_organization_id uuid,
  p_trip_id uuid,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.lock_editable_trip_overnight(
    p_organization_id, p_trip_id, p_expected_revision
  );
  update public.trip_overnights
  set adjusted_overnights = null, adjustment_reason = null,
      adjusted_by = null, adjusted_at = null,
      reviewed_by = auth.uid(), reviewed_at = now(),
      updated_by = auth.uid(), revision = revision + 1
  where organization_id = p_organization_id and trip_id = p_trip_id;
  return found;
end;
$$;

revoke all on public.trip_overnights from public, anon, authenticated;
grant select on public.trip_overnights to authenticated;

alter table public.trip_overnights enable row level security;

create policy trip_overnights_select_administrative
on public.trip_overnights for select to authenticated using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
);

revoke all on function private.calculate_trip_overnights(timestamptz, timestamptz, text)
  from public, anon, authenticated;
revoke all on function private.sync_trip_overnights()
  from public, anon, authenticated;
revoke all on function private.lock_editable_trip_overnight(uuid, uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.ensure_trip_overnight_calculation(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.review_trip_overnights(uuid, uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.adjust_trip_overnights(uuid, uuid, integer, text, bigint)
  from public, anon, authenticated;
revoke all on function public.reset_trip_overnight_adjustment(uuid, uuid, bigint)
  from public, anon, authenticated;

grant execute on function public.ensure_trip_overnight_calculation(uuid, uuid)
  to authenticated;
grant execute on function public.review_trip_overnights(uuid, uuid, bigint)
  to authenticated;
grant execute on function public.adjust_trip_overnights(uuid, uuid, integer, text, bigint)
  to authenticated;
grant execute on function public.reset_trip_overnight_adjustment(uuid, uuid, bigint)
  to authenticated;

comment on table public.trip_overnights is
  'Estado atual do cálculo e da revisão de pernoites de uma viagem.';
comment on column public.trip_overnights.calculated_overnights is
  'Diferença entre as datas locais de retorno e saída no timezone registrado.';
comment on column public.trip_overnights.revision is
  'Versão otimista incrementada em todo recalculo, revisão ou ajuste.';
