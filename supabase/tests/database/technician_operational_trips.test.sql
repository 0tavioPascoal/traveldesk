begin;

select plan(8);

select has_function(
  'public', 'list_my_operational_trips', array['uuid', 'uuid', 'integer'],
  'RPC de viagens operacionais do técnico existe'
);

insert into auth.users (id, email, raw_user_meta_data) values
  ('e9000000-0000-4000-8000-000000000001', 'operational-admin@example.test', '{}'),
  ('e1000000-0000-4000-8000-000000000002', 'operational-technician@example.test', '{}'),
  ('e1000000-0000-4000-8000-000000000003', 'operational-other@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('f1100000-0000-4000-8000-000000000001', 'Operacional A', 'operacional-a', 'America/Sao_Paulo'),
  ('e1100000-0000-4000-8000-000000000002', 'Operacional B', 'operacional-b', 'America/Sao_Paulo');
insert into public.organization_members (organization_id, profile_id, role, status) values
  ('f1100000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('f1100000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'technician', 'active'),
  ('f1100000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('e1100000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000003', 'technician', 'active');

insert into public.clients (id, organization_id, legal_name, created_by, updated_by) values
  ('fa200000-0000-4000-8000-000000000001', 'f1100000-0000-4000-8000-000000000001', 'Cliente A', 'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('fa300000-0000-4000-8000-000000000001', 'f1100000-0000-4000-8000-000000000001', 'fa200000-0000-4000-8000-000000000001', 'Unidade A', 'Campinas', 'SP', 'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001');
insert into public.service_types (id, organization_id, name, created_by, updated_by) values
  ('fa400000-0000-4000-8000-000000000001', 'f1100000-0000-4000-8000-000000000001', 'Atendimento A', 'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001');
insert into public.technicians (
  id, organization_id, profile_id, name, base_city, base_state, driver_license_number,
  driver_license_category, driver_license_expires_at,
  can_drive_company_vehicle, created_by, updated_by
) values
  ('fa500000-0000-4000-8000-000000000001', 'f1100000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'Técnico A', 'São Paulo', 'SP', '11111111111', 'B', '2035-12-31', true, 'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001'),
  ('fa500000-0000-4000-8000-000000000002', 'f1100000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'Técnico B', 'São Paulo', 'SP', '22222222222', 'B', '2035-12-31', true, 'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001');
insert into public.vehicles (
  id, organization_id, plate, brand, model, passenger_capacity, base_city, base_state,
  operational_status, created_by, updated_by
) values (
  'fa550000-0000-4000-8000-000000000001', 'f1100000-0000-4000-8000-000000000001',
  'OPS1A23', 'Marca', 'Modelo', 4, 'São Paulo', 'SP', 'available',
  'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001'
);

select set_config('request.jwt.claim.sub', 'e9000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
insert into public.trips (
  id, organization_id, client_id, client_unit_id, service_type_id,
  title, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, created_by, updated_by
) values
  (
    'fa600000-0000-4000-8000-000000000001', 'f1100000-0000-4000-8000-000000000001',
    'fa200000-0000-4000-8000-000000000001', 'fa300000-0000-4000-8000-000000000001',
    'fa400000-0000-4000-8000-000000000001', 'Viagem visível', 'planned',
    '2030-09-10 10:00+00', '2030-09-10 20:00+00', '2030-09-10 13:00+00',
    '2030-09-10 17:00+00', 'São Paulo', 'SP', 'Campinas', 'SP',
    'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001'
  ),
  (
    'fa600000-0000-4000-8000-000000000002', 'f1100000-0000-4000-8000-000000000001',
    'fa200000-0000-4000-8000-000000000001', 'fa300000-0000-4000-8000-000000000001',
    'fa400000-0000-4000-8000-000000000001', 'Viagem não alocada', 'planned',
    '2030-09-11 10:00+00', '2030-09-11 20:00+00', '2030-09-11 13:00+00',
    '2030-09-11 17:00+00', 'São Paulo', 'SP', 'Campinas', 'SP',
    'e9000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001'
  );

set local role authenticated;
select ok(public.replace_trip_technicians(
  'f1100000-0000-4000-8000-000000000001',
  'fa600000-0000-4000-8000-000000000001',
  '[{"technician_id":"fa500000-0000-4000-8000-000000000001","is_responsible":true}]'
), 'técnico responsável é alocado');
select public.assign_trip_vehicle_and_driver(
  'f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000001',
  'fa550000-0000-4000-8000-000000000001', 'fa500000-0000-4000-8000-000000000001', null
);
select public.review_trip_overnights(
  'f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000001', 1
);
select ok(public.confirm_trip(
  'f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000001'
), 'viagem alocada é confirmada');
select public.replace_trip_technicians(
  'f1100000-0000-4000-8000-000000000001',
  'fa600000-0000-4000-8000-000000000002',
  '[{"technician_id":"fa500000-0000-4000-8000-000000000002","is_responsible":true}]'
);
select public.assign_trip_vehicle_and_driver(
  'f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000002',
  'fa550000-0000-4000-8000-000000000001', 'fa500000-0000-4000-8000-000000000002', null
);
select public.review_trip_overnights(
  'f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000002', 1
);
select ok(public.confirm_trip(
  'f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000002'
), 'viagem não alocada é confirmada');

reset role;
select set_config('request.jwt.claim.sub', 'e1000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select results_eq(
  $$select title, is_responsible from public.list_my_operational_trips('f1100000-0000-4000-8000-000000000001', null, 12)$$,
  $$values ('Viagem visível'::text, true)$$,
  'técnico consulta somente a viagem em que está alocado'
);
select results_eq(
  $$select count(*) from public.list_my_operational_trips('f1100000-0000-4000-8000-000000000001', 'fa600000-0000-4000-8000-000000000002', 1)$$,
  $$values (0::bigint)$$,
  'ID de viagem não alocada não revela dados'
);
select throws_ok(
  $$select public.list_my_operational_trips('e1100000-0000-4000-8000-000000000002', null, 12)$$,
  'P0001', 'trip_transition_not_found',
  'outra organização não revela viagens'
);

reset role;
select set_config('request.jwt.claim.sub', 'e9000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select throws_ok(
  $$select public.list_my_operational_trips('f1100000-0000-4000-8000-000000000001', null, 12)$$,
  'P0001', 'trip_transition_not_found',
  'administrador não usa a superfície exclusiva do técnico'
);

select * from finish();
rollback;
