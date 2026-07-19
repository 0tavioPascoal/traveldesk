create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  legal_name text not null,
  trade_name text,
  tax_id text,
  segment text,
  notes text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clients_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,
  constraint clients_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete restrict,
  constraint clients_updated_by_fkey
    foreign key (updated_by)
    references public.profiles (id)
    on delete restrict,
  constraint clients_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint clients_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint clients_organization_id_id_key unique (organization_id, id),
  constraint clients_legal_name_format check (
    legal_name = btrim(legal_name)
    and char_length(legal_name) between 2 and 200
  ),
  constraint clients_trade_name_format check (
    trade_name is null
    or (
      trade_name = btrim(trade_name)
      and char_length(trade_name) between 2 and 200
    )
  ),
  constraint clients_tax_id_format check (
    tax_id is null or tax_id ~ '^[0-9]{14}$'
  ),
  constraint clients_segment_format check (
    segment is null
    or (
      segment = btrim(segment)
      and char_length(segment) between 2 and 120
    )
  ),
  constraint clients_notes_format check (
    notes is null
    or (
      notes = btrim(notes)
      and char_length(notes) between 1 and 2000
    )
  )
);

create table public.client_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  client_id uuid not null,
  name text not null,
  tax_id text,
  address_line text,
  address_number text,
  address_complement text,
  district text,
  city text not null,
  state text not null,
  postal_code text,
  contact_name text,
  contact_email text,
  contact_phone text,
  access_instructions text,
  notes text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_units_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete restrict,
  constraint client_units_client_fkey
    foreign key (organization_id, client_id)
    references public.clients (organization_id, id)
    on delete restrict,
  constraint client_units_created_by_fkey
    foreign key (created_by)
    references public.profiles (id)
    on delete restrict,
  constraint client_units_updated_by_fkey
    foreign key (updated_by)
    references public.profiles (id)
    on delete restrict,
  constraint client_units_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint client_units_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id)
    on delete restrict,
  constraint client_units_name_format check (
    name = btrim(name)
    and char_length(name) between 2 and 160
  ),
  constraint client_units_tax_id_format check (
    tax_id is null or tax_id ~ '^[0-9]{14}$'
  ),
  constraint client_units_address_line_format check (
    address_line is null
    or (
      address_line = btrim(address_line)
      and char_length(address_line) between 1 and 200
    )
  ),
  constraint client_units_address_number_format check (
    address_number is null
    or (
      address_number = btrim(address_number)
      and char_length(address_number) between 1 and 30
    )
  ),
  constraint client_units_address_complement_format check (
    address_complement is null
    or (
      address_complement = btrim(address_complement)
      and char_length(address_complement) between 1 and 120
    )
  ),
  constraint client_units_district_format check (
    district is null
    or (
      district = btrim(district)
      and char_length(district) between 1 and 120
    )
  ),
  constraint client_units_city_format check (
    city = btrim(city)
    and char_length(city) between 2 and 120
  ),
  constraint client_units_state_format check (state ~ '^[A-Z]{2}$'),
  constraint client_units_postal_code_format check (
    postal_code is null or postal_code ~ '^[0-9]{8}$'
  ),
  constraint client_units_contact_name_format check (
    contact_name is null
    or (
      contact_name = btrim(contact_name)
      and char_length(contact_name) between 1 and 160
    )
  ),
  constraint client_units_contact_email_format check (
    contact_email is null
    or (
      contact_email = lower(btrim(contact_email))
      and char_length(contact_email) between 3 and 254
    )
  ),
  constraint client_units_contact_phone_format check (
    contact_phone is null or contact_phone ~ '^[0-9]{10,11}$'
  ),
  constraint client_units_access_instructions_format check (
    access_instructions is null
    or (
      access_instructions = btrim(access_instructions)
      and char_length(access_instructions) between 1 and 2000
    )
  ),
  constraint client_units_notes_format check (
    notes is null
    or (
      notes = btrim(notes)
      and char_length(notes) between 1 and 2000
    )
  )
);

create unique index clients_organization_legal_name_lower_key
  on public.clients (organization_id, lower(legal_name));

create unique index clients_organization_tax_id_key
  on public.clients (organization_id, tax_id)
  where tax_id is not null;

create index clients_organization_active_legal_name_idx
  on public.clients (organization_id, active, legal_name);

create unique index client_units_client_name_lower_key
  on public.client_units (organization_id, client_id, lower(name));

create unique index client_units_organization_tax_id_key
  on public.client_units (organization_id, tax_id)
  where tax_id is not null;

create index client_units_client_active_name_idx
  on public.client_units (organization_id, client_id, active, name);

create trigger clients_set_updated_at
before update on public.clients
for each row execute function private.set_updated_at();

create trigger client_units_set_updated_at
before update on public.client_units
for each row execute function private.set_updated_at();

create function private.is_active_client(
  target_organization_id uuid,
  target_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clients as client
    where client.organization_id = target_organization_id
      and client.id = target_client_id
      and client.active
  );
$$;

create function private.client_has_active_units(
  target_organization_id uuid,
  target_client_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.client_units as unit
    where unit.organization_id = target_organization_id
      and unit.client_id = target_client_id
      and unit.active
  );
$$;

revoke all on function private.is_active_client(uuid, uuid)
  from public, anon, authenticated;
revoke all on function private.client_has_active_units(uuid, uuid)
  from public, anon, authenticated;

grant execute on function private.is_active_client(uuid, uuid)
  to authenticated;
grant execute on function private.client_has_active_units(uuid, uuid)
  to authenticated;

revoke all on public.clients from anon, authenticated;
revoke all on public.client_units from anon, authenticated;

grant select on public.clients to authenticated;
grant insert (
  organization_id,
  legal_name,
  trade_name,
  tax_id,
  segment,
  notes,
  active,
  created_by,
  updated_by
) on public.clients to authenticated;
grant update (
  legal_name,
  trade_name,
  tax_id,
  segment,
  notes,
  active,
  updated_by
) on public.clients to authenticated;

grant select on public.client_units to authenticated;
grant insert (
  organization_id,
  client_id,
  name,
  tax_id,
  address_line,
  address_number,
  address_complement,
  district,
  city,
  state,
  postal_code,
  contact_name,
  contact_email,
  contact_phone,
  access_instructions,
  notes,
  active,
  created_by,
  updated_by
) on public.client_units to authenticated;
grant update (
  name,
  tax_id,
  address_line,
  address_number,
  address_complement,
  district,
  city,
  state,
  postal_code,
  contact_name,
  contact_email,
  contact_phone,
  access_instructions,
  notes,
  active,
  updated_by
) on public.client_units to authenticated;

alter table public.clients enable row level security;
alter table public.client_units enable row level security;

create policy clients_select_administrative
on public.clients
for select
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy clients_insert_administrative
on public.clients
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

create policy clients_update_administrative
on public.clients
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
  and (
    active
    or not (select private.client_has_active_units(organization_id, id))
  )
);

create policy client_units_select_administrative
on public.client_units
for select
to authenticated
using (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
);

create policy client_units_insert_administrative
on public.client_units
for insert
to authenticated
with check (
  (select private.has_organization_role(
    organization_id,
    array['admin', 'coordinator']::public.organization_role[]
  ))
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
  and (select private.is_active_client(organization_id, client_id))
);

create policy client_units_update_administrative
on public.client_units
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
  and (
    not active
    or (select private.is_active_client(organization_id, client_id))
  )
);
