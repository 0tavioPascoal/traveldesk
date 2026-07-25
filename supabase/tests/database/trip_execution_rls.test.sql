begin;

select plan(29);

select has_table('public', 'trip_status_history', 'histórico de execução existe');
select has_column('public', 'trips', 'finished_at', 'viagem registra data de conclusão');
select has_column('public', 'trips', 'finished_by', 'viagem registra autor da conclusão');
select has_function('public', 'transition_trip_status', array['uuid', 'uuid', 'trip_status', 'text'], 'RPC de transição existe');

insert into auth.users (id, email, raw_user_meta_data) values
  ('c1000000-0000-4000-8000-000000000001', 'execution-admin@example.test', '{}'),
  ('c1000000-0000-4000-8000-000000000002', 'execution-responsible@example.test', '{}'),
  ('c1000000-0000-4000-8000-000000000003', 'execution-other-tech@example.test', '{}'),
  ('d1000000-0000-4000-8000-000000000001', 'execution-other-admin@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('c1100000-0000-4000-8000-000000000001', 'Execução A', 'execucao-a', 'America/Sao_Paulo'),
  ('d1100000-0000-4000-8000-000000000001', 'Execução B', 'execucao-b', 'America/Sao_Paulo');
insert into public.organization_members (organization_id, profile_id, role, status) values
  ('c1100000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('c1100000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'technician', 'active'),
  ('c1100000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('d1100000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.clients (id, organization_id, legal_name, created_by, updated_by) values
  ('c1200000-0000-4000-8000-000000000001', 'c1100000-0000-4000-8000-000000000001', 'Cliente Execução', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('c1300000-0000-4000-8000-000000000001', 'c1100000-0000-4000-8000-000000000001', 'c1200000-0000-4000-8000-000000000001', 'Unidade Execução', 'Campinas', 'SP', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001');
insert into public.service_types (id, organization_id, name, created_by, updated_by) values
  ('c1400000-0000-4000-8000-000000000001', 'c1100000-0000-4000-8000-000000000001', 'Implantação', 'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001');
insert into public.technicians (
  id, organization_id, profile_id, name, base_city, base_state,
  driver_license_number, driver_license_category, driver_license_expires_at,
  can_drive_company_vehicle, created_by, updated_by
) values (
  'c1500000-0000-4000-8000-000000000001', 'c1100000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002', 'Responsável', 'São Paulo', 'SP',
  '12345678901', 'B', '2035-12-31', true,
  'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001'
);
insert into public.vehicles (
  id, organization_id, plate, brand, model, passenger_capacity, base_city,
  base_state, operational_status, created_by, updated_by
) values (
  'c1600000-0000-4000-8000-000000000001', 'c1100000-0000-4000-8000-000000000001',
  'EXE1C23', 'Fiat', 'Cronos', 4, 'São Paulo', 'SP', 'available',
  'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001'
);

select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.trips (
  id, organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_legal_name_snapshot, client_unit_name_snapshot,
  title, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, created_by, updated_by
) values (
  'c1700000-0000-4000-8000-000000000001', 'c1100000-0000-4000-8000-000000000001',
  'IGNORADO', 'c1200000-0000-4000-8000-000000000001', 'c1300000-0000-4000-8000-000000000001',
  'c1400000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada',
  'Fluxo operacional', 'planned', '2030-08-10 10:00+00', '2030-08-12 23:00+00',
  '2030-08-10 13:00+00', '2030-08-12 20:00+00', 'São Paulo', 'SP', 'Campinas', 'SP',
  'c1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001'
);
set local role authenticated;
select public.replace_trip_technicians(
  'c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001',
  '[{"technician_id":"c1500000-0000-4000-8000-000000000001","is_responsible":true}]'
);
select public.assign_trip_vehicle_and_driver(
  'c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001',
  'c1600000-0000-4000-8000-000000000001', 'c1500000-0000-4000-8000-000000000001', null
);
select public.review_trip_overnights(
  'c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 1
);
select ok(public.confirm_trip('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001'), 'viagem é confirmada');
savepoint cancellation_case;
select ok(public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'traveling', null), 'viagem entra em execução antes do cancelamento');
select ok(public.cancel_trip('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'Cancelamento durante o deslocamento'), 'execução pode ser cancelada');
select results_eq($$select count(*) from public.trip_status_history where trip_id = 'c1700000-0000-4000-8000-000000000001' and to_status = 'canceled'$$, $$values (1::bigint)$$, 'cancelamento operacional gera histórico');
select throws_ok($$select public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'at_client', null)$$, 'P0001', 'trip_canceled', 'cancelada não continua a execução');
rollback to savepoint cancellation_case;
select throws_ok(
  $$select public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'in_service', null)$$,
  'P0001', 'trip_invalid_transition', 'salto de etapa é rejeitado'
);

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select ok(public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'traveling', 'Saída registrada pelo responsável'), 'responsável inicia deslocamento');
select results_eq($$select count(*) from public.trip_status_history where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, $$values (2::bigint)$$, 'responsável consulta histórico da própria viagem');

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select throws_ok(
  $$select public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'at_client', null)$$,
  'P0001', 'trip_transition_not_authorized', 'técnico não responsável não altera a viagem'
);
select results_eq($$select count(*) from public.trip_status_history$$, $$values (0::bigint)$$, 'técnico não alocado não consulta histórico');

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select ok(public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'at_client', null), 'admin registra chegada');

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select ok(public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'in_service', 'Cliente liberou o acesso'), 'responsável inicia atendimento');
select ok(public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'returning', null), 'responsável inicia retorno');
select ok(public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'finished', null), 'responsável finaliza viagem');

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq($$select status, finished_by, finished_at is not null from public.trips where id = 'c1700000-0000-4000-8000-000000000001'$$, $$values ('finished'::public.trip_status, 'c1000000-0000-4000-8000-000000000002'::uuid, true)$$, 'conclusão registra auditoria');
select results_eq($$select count(*) from public.trip_status_history where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, $$values (6::bigint)$$, 'confirmação e cinco etapas formam o histórico');
select results_eq($$select string_agg(to_status::text, ',' order by occurred_at, id) from public.trip_status_history where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, $$values ('confirmed,traveling,at_client,in_service,returning,finished'::text)$$, 'histórico preserva a ordem do fluxo');
select results_eq($$select bool_and(not blocks_schedule) from public.trip_technicians where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, $$values (true)$$, 'conclusão libera agenda do técnico');
select results_eq($$select not blocks_schedule from public.trip_vehicle_assignments where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, $$values (true)$$, 'conclusão libera agenda do veículo');
select throws_ok($$select public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'traveling', null)$$, 'P0001', 'trip_already_finished', 'finalizada é terminal');
select throws_ok($$update public.trip_status_history set note = 'alterada' where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, '42501', null, 'histórico não pode ser editado');
select throws_ok($$delete from public.trip_status_history where trip_id = 'c1700000-0000-4000-8000-000000000001'$$, '42501', null, 'histórico não pode ser apagado');

reset role;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq($$select public.cancel_trip('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'Cancelamento tardio indevido')$$, $$values (false)$$, 'finalizada não pode ser cancelada');

reset role;
select set_config('request.jwt.claim.sub', 'd1000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select throws_ok(
  $$select public.transition_trip_status('c1100000-0000-4000-8000-000000000001', 'c1700000-0000-4000-8000-000000000001', 'traveling', null)$$,
  'P0001', 'trip_transition_not_authorized', 'outro tenant não altera viagem'
);
select results_eq($$select count(*) from public.trip_status_history$$, $$values (0::bigint)$$, 'outro tenant não consulta histórico');

select * from finish();
rollback;
