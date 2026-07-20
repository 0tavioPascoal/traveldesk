create type public.vehicle_operational_status as enum (
  'available',
  'maintenance',
  'blocked'
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  plate text not null,
  brand text not null,
  model text not null,
  manufacture_year smallint,
  model_year smallint,
  passenger_capacity smallint not null,
  base_city text not null,
  base_state text not null,
  current_mileage bigint,
  operational_status public.vehicle_operational_status not null default 'available',
  licensing_expires_at date,
  maintenance_due_at date,
  notes text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,
  constraint vehicles_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete restrict,
  constraint vehicles_updated_by_fkey
    foreign key (updated_by)
    references public.profiles (id)
    on delete restrict,
  constraint vehicles_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint vehicles_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint vehicles_organization_id_id_key unique (organization_id, id),
  constraint vehicles_plate_format check (
    plate ~ '^(?:[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$'
  ),
  constraint vehicles_brand_format check (
    brand = btrim(brand)
    and char_length(brand) between 2 and 80
  ),
  constraint vehicles_model_format check (
    model = btrim(model)
    and char_length(model) between 2 and 120
  ),
  constraint vehicles_manufacture_year_range check (
    manufacture_year is null or manufacture_year between 1900 and 9999
  ),
  constraint vehicles_model_year_range check (
    model_year is null or model_year between 1900 and 9999
  ),
  constraint vehicles_years_relationship check (
    manufacture_year is null
    or model_year is null
    or model_year between manufacture_year and manufacture_year + 1
  ),
  constraint vehicles_passenger_capacity_range check (
    passenger_capacity between 1 and 99
  ),
  constraint vehicles_base_city_format check (
    base_city = btrim(base_city)
    and char_length(base_city) between 2 and 120
  ),
  constraint vehicles_base_state_format check (base_state ~ '^[A-Z]{2}$'),
  constraint vehicles_current_mileage_range check (
    current_mileage is null or current_mileage >= 0
  ),
  constraint vehicles_notes_format check (
    notes is null
    or (
      notes = btrim(notes)
      and char_length(notes) between 1 and 2000
    )
  )
);

create unique index vehicles_organization_plate_key
  on public.vehicles (organization_id, plate);

create index vehicles_organization_active_status_idx
  on public.vehicles (organization_id, active, operational_status, brand, model);

create index vehicles_organization_base_state_idx
  on public.vehicles (organization_id, base_state);

create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function private.set_updated_at();

create function private.prevent_vehicle_mileage_reduction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.current_mileage is not null
    and (
      new.current_mileage is null
      or new.current_mileage < old.current_mileage
    )
    and not private.has_organization_role(
      old.organization_id,
      array['admin']::public.organization_role[]
    )
  then
    raise exception using
      errcode = 'P0001',
      message = 'vehicle_mileage_reduction_forbidden';
  end if;

  return new;
end;
$$;

create trigger vehicles_prevent_mileage_reduction
before update of current_mileage on public.vehicles
for each row execute function private.prevent_vehicle_mileage_reduction();

revoke all on function private.prevent_vehicle_mileage_reduction()
  from public, anon, authenticated;

revoke all on public.vehicles from anon, authenticated;

grant usage on type public.vehicle_operational_status to authenticated;
grant select on public.vehicles to authenticated;
grant insert (
  organization_id,
  plate,
  brand,
  model,
  manufacture_year,
  model_year,
  passenger_capacity,
  base_city,
  base_state,
  current_mileage,
  operational_status,
  licensing_expires_at,
  maintenance_due_at,
  notes,
  active,
  created_by,
  updated_by
) on public.vehicles to authenticated;
grant update (
  plate,
  brand,
  model,
  manufacture_year,
  model_year,
  passenger_capacity,
  base_city,
  base_state,
  current_mileage,
  operational_status,
  licensing_expires_at,
  maintenance_due_at,
  notes,
  active,
  updated_by
) on public.vehicles to authenticated;

alter table public.vehicles enable row level security;

create policy vehicles_select_administrative
on public.vehicles
for select
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy vehicles_insert_administrative
on public.vehicles
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

create policy vehicles_update_administrative
on public.vehicles
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
