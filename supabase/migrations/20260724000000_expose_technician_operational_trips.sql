set search_path = public, extensions;

create function public.list_my_operational_trips(
  p_organization_id uuid,
  p_trip_id uuid default null,
  p_limit integer default 12
)
returns table (
  id uuid,
  code text,
  title text,
  client_name text,
  client_unit_name text,
  destination_city text,
  destination_state text,
  travel_starts_at timestamptz,
  travel_ends_at timestamptz,
  service_starts_at timestamptz,
  service_ends_at timestamptz,
  priority public.trip_priority,
  status public.trip_status,
  is_responsible boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.has_organization_role(
    p_organization_id,
    array['technician']::public.organization_role[]
  ) then
    raise exception using errcode = 'P0001', message = 'trip_transition_not_found';
  end if;

  return query
    select
      trip.id,
      trip.code,
      trip.title,
      trip.client_name_snapshot,
      trip.client_unit_name_snapshot,
      trip.destination_city,
      trip.destination_state,
      trip.travel_starts_at,
      trip.travel_ends_at,
      trip.service_starts_at,
      trip.service_ends_at,
      trip.priority,
      trip.status,
      allocation.is_responsible
    from public.trip_technicians allocation
    join public.technicians technician
      on technician.organization_id = allocation.organization_id
      and technician.id = allocation.technician_id
    join public.trips trip
      on trip.organization_id = allocation.organization_id
      and trip.id = allocation.trip_id
    where allocation.organization_id = p_organization_id
      and technician.profile_id = auth.uid()
      and technician.active
      and (p_trip_id is null or trip.id = p_trip_id)
      and trip.status in (
        'confirmed'::public.trip_status,
        'traveling'::public.trip_status,
        'at_client'::public.trip_status,
        'in_service'::public.trip_status,
        'returning'::public.trip_status,
        'finished'::public.trip_status,
        'canceled'::public.trip_status
      )
    order by
      case when trip.status in (
        'confirmed'::public.trip_status,
        'traveling'::public.trip_status,
        'at_client'::public.trip_status,
        'in_service'::public.trip_status,
        'returning'::public.trip_status
      ) then 0 else 1 end,
      trip.travel_starts_at desc nulls last,
      trip.id
    limit least(greatest(coalesce(p_limit, 12), 1), 50);
end;
$$;

revoke all on function public.list_my_operational_trips(uuid, uuid, integer)
from public, anon, authenticated;
grant execute on function public.list_my_operational_trips(uuid, uuid, integer)
to authenticated;

comment on function public.list_my_operational_trips(uuid, uuid, integer) is
  'Lista somente viagens operacionais alocadas ao técnico autenticado, sem ampliar SELECT direto nas tabelas.';
