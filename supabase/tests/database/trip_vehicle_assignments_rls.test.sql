begin;

select plan(41);

select has_table('public', 'trip_vehicle_assignments', 'reservas de veículo devem existir');
select policies_are('public', 'trip_vehicle_assignments', array[
  'trip_vehicle_assignments_delete_administrative',
  'trip_vehicle_assignments_insert_administrative',
  'trip_vehicle_assignments_select_administrative',
  'trip_vehicle_assignments_update_administrative'
], 'reservas devem possuir policies administrativas completas');
select ok(exists (
  select 1 from pg_constraint where conname = 'trip_vehicle_assignments_driver_fkey'
), 'motorista deve possuir foreign key para a equipe');
select ok(exists (
  select 1 from pg_constraint where conname = 'trip_vehicle_assignments_no_planned_overlap'
), 'veículo deve possuir proteção de sobreposição');
select has_index('public', 'trip_vehicle_assignments', 'trip_vehicle_assignments_trip_key', 'viagem deve possuir somente uma reserva');

insert into auth.users (id, email, raw_user_meta_data) values
  ('81000000-0000-4000-8000-000000000001', 'transport-admin-a@example.test', '{}'),
  ('81000000-0000-4000-8000-000000000002', 'transport-coord-a@example.test', '{}'),
  ('81000000-0000-4000-8000-000000000003', 'transport-tech-a@example.test', '{}'),
  ('81000000-0000-4000-8000-000000000004', 'transport-blocked-a@example.test', '{}'),
  ('82000000-0000-4000-8000-000000000001', 'transport-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('a8000000-0000-4000-8000-000000000001', 'Transporte A', 'transporte-a', 'America/Sao_Paulo'),
  ('b8000000-0000-4000-8000-000000000001', 'Transporte B', 'transporte-b', 'America/Sao_Paulo');
insert into public.organization_members (organization_id, profile_id, role, status) values
  ('a8000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('a8000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('a8000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('a8000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000004', 'admin', 'blocked'),
  ('b8000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.technicians (
  id, organization_id, name, base_city, base_state,
  driver_license_number, driver_license_category, driver_license_expires_at,
  can_drive_company_vehicle, created_by, updated_by
) values
  ('a8100000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'Motorista Um', 'São Paulo', 'SP', '12345678901', 'B', '2031-12-31', true, '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8100000-0000-4000-8000-000000000002', 'a8000000-0000-4000-8000-000000000001', 'Motorista Dois', 'Campinas', 'SP', '12345678902', 'B', '2031-12-31', true, '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8100000-0000-4000-8000-000000000003', 'a8000000-0000-4000-8000-000000000001', 'Sem habilitação', 'Santos', 'SP', null, null, null, false, '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8100000-0000-4000-8000-000000000004', 'a8000000-0000-4000-8000-000000000001', 'CNH vencida', 'Franca', 'SP', '12345678904', 'B', '2029-12-31', true, '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8100000-0000-4000-8000-000000000005', 'a8000000-0000-4000-8000-000000000001', 'Participante extra', 'Franca', 'SP', null, null, null, false, '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('b8100000-0000-4000-8000-000000000001', 'b8000000-0000-4000-8000-000000000001', 'Motorista B', 'Franca', 'SP', '22345678901', 'B', '2031-12-31', true, '82000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001');

insert into public.vehicles (
  id, organization_id, plate, brand, model, passenger_capacity, base_city,
  base_state, operational_status, created_by, updated_by
) values
  ('a8200000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'TRA1A11', 'Fiat', 'Cronos', 3, 'São Paulo', 'SP', 'available', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8200000-0000-4000-8000-000000000002', 'a8000000-0000-4000-8000-000000000001', 'TRA2A22', 'Fiat', 'Strada', 1, 'São Paulo', 'SP', 'available', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8200000-0000-4000-8000-000000000003', 'a8000000-0000-4000-8000-000000000001', 'TRA3A33', 'Ford', 'Transit', 10, 'São Paulo', 'SP', 'maintenance', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8200000-0000-4000-8000-000000000004', 'a8000000-0000-4000-8000-000000000001', 'TRA4A44', 'VW', 'Virtus', 5, 'São Paulo', 'SP', 'available', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('b8200000-0000-4000-8000-000000000001', 'b8000000-0000-4000-8000-000000000001', 'TRB1B11', 'Fiat', 'Cronos', 5, 'Franca', 'SP', 'available', '82000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001');

insert into public.clients (id, organization_id, legal_name, created_by, updated_by) values
  ('a8300000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'Cliente Transporte A', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('b8300000-0000-4000-8000-000000000001', 'b8000000-0000-4000-8000-000000000001', 'Cliente Transporte B', '82000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('a8400000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'a8300000-0000-4000-8000-000000000001', 'Unidade A', 'Ribeirão Preto', 'SP', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('b8400000-0000-4000-8000-000000000001', 'b8000000-0000-4000-8000-000000000001', 'b8300000-0000-4000-8000-000000000001', 'Unidade B', 'Franca', 'SP', '82000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001');
insert into public.service_types (id, organization_id, name, created_by, updated_by) values
  ('a8500000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'Implantação', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('b8500000-0000-4000-8000-000000000001', 'b8000000-0000-4000-8000-000000000001', 'Implantação', '82000000-0000-4000-8000-000000000001', '82000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.trips (
  id, organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_legal_name_snapshot, client_unit_name_snapshot,
  title, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, created_by, updated_by
) values
  ('a8600000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'IGNORADO', 'a8300000-0000-4000-8000-000000000001', 'a8400000-0000-4000-8000-000000000001', 'a8500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem principal', 'planned', '2030-08-01 11:00+00', '2030-08-01 21:00+00', '2030-08-01 12:00+00', '2030-08-01 20:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8600000-0000-4000-8000-000000000002', 'a8000000-0000-4000-8000-000000000001', 'IGNORADO', 'a8300000-0000-4000-8000-000000000001', 'a8400000-0000-4000-8000-000000000001', 'a8500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem sobreposta', 'draft', '2030-08-01 12:00+00', '2030-08-01 18:00+00', '2030-08-01 13:00+00', '2030-08-01 17:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8600000-0000-4000-8000-000000000003', 'a8000000-0000-4000-8000-000000000001', 'IGNORADO', 'a8300000-0000-4000-8000-000000000001', 'a8400000-0000-4000-8000-000000000001', 'a8500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem encostada', 'draft', '2030-08-01 21:00+00', '2030-08-02 02:00+00', '2030-08-01 21:00+00', '2030-08-02 01:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8600000-0000-4000-8000-000000000004', 'a8000000-0000-4000-8000-000000000001', 'IGNORADO', 'a8300000-0000-4000-8000-000000000001', 'a8400000-0000-4000-8000-000000000001', null, 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem sem período', 'draft', null, null, null, null, null, null, null, null, '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001'),
  ('a8600000-0000-4000-8000-000000000005', 'a8000000-0000-4000-8000-000000000001', 'IGNORADO', 'a8300000-0000-4000-8000-000000000001', 'a8400000-0000-4000-8000-000000000001', 'a8500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem CNH', 'draft', '2030-09-01 11:00+00', '2030-09-01 21:00+00', '2030-09-01 12:00+00', '2030-09-01 20:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001');

insert into public.vehicle_unavailability_types (id, organization_id, name, created_by, updated_by)
values ('a8700000-0000-4000-8000-000000000001', 'a8000000-0000-4000-8000-000000000001', 'Manutenção', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001');
insert into public.vehicle_unavailabilities (organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at, created_by, updated_by)
values ('a8000000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000004', 'a8700000-0000-4000-8000-000000000001', '2030-08-01 10:00+00', '2030-08-01 22:00+00', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001');

set local role authenticated;

select ok(public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', '[{"technician_id":"a8100000-0000-4000-8000-000000000001","is_responsible":true},{"technician_id":"a8100000-0000-4000-8000-000000000003","is_responsible":false}]'), 'equipe principal criada');
select ok(public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', '[{"technician_id":"a8100000-0000-4000-8000-000000000002","is_responsible":true}]'), 'equipe sobreposta criada');
select ok(public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000003', '[{"technician_id":"a8100000-0000-4000-8000-000000000002","is_responsible":true}]'), 'equipe encostada criada');
select ok(public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000005', '[{"technician_id":"a8100000-0000-4000-8000-000000000004","is_responsible":true}]'), 'equipe com CNH vencida criada');

select ok(public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000001', 'Reserva principal'), 'admin reserva veículo e motorista');
select results_eq($$select vehicle_id, driver_technician_id, blocks_schedule from public.trip_vehicle_assignments where trip_id = 'a8600000-0000-4000-8000-000000000001'$$, $$values ('a8200000-0000-4000-8000-000000000001'::uuid, 'a8100000-0000-4000-8000-000000000001'::uuid, true)$$, 'reserva planejada bloqueia agenda');
select results_eq($$select created_by, updated_by from public.trip_vehicle_assignments where trip_id = 'a8600000-0000-4000-8000-000000000001'$$, $$values ('81000000-0000-4000-8000-000000000001'::uuid, '81000000-0000-4000-8000-000000000001'::uuid)$$, 'auditoria usa usuário autenticado');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000002', null)$$, 'P0001', 'trip_vehicle_schedule_conflict', 'sobreposição com viagem planejada é rejeitada');
select lives_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000003', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000002', null)$$, 'períodos encostados são permitidos');
select throws_ok($$update public.trips set travel_starts_at = '2030-08-01 20:00+00', updated_by = '81000000-0000-4000-8000-000000000001' where id = 'a8600000-0000-4000-8000-000000000003'$$, 'P0001', 'trip_vehicle_schedule_conflict', 'alteração do período revalida a reserva do veículo');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000004', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000001', null)$$, 'P0001', 'trip_transport_period_required', 'viagem sem período não reserva');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000002', 'a8100000-0000-4000-8000-000000000001', null)$$, 'P0001', 'trip_vehicle_capacity_exceeded', 'capacidade insuficiente é rejeitada');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000002', null)$$, 'P0001', 'trip_driver_not_allocated', 'motorista deve estar na equipe');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000003', null)$$, 'P0001', 'trip_driver_not_eligible', 'técnico sem autorização não dirige');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000005', 'a8200000-0000-4000-8000-000000000002', 'a8100000-0000-4000-8000-000000000004', null)$$, 'P0001', 'trip_driver_license_expired', 'CNH deve valer até o fim da viagem');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', 'a8200000-0000-4000-8000-000000000003', 'a8100000-0000-4000-8000-000000000002', null)$$, 'P0001', 'trip_vehicle_not_available', 'veículo em manutenção não reserva');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', 'a8200000-0000-4000-8000-000000000004', 'a8100000-0000-4000-8000-000000000002', null)$$, 'P0001', 'trip_vehicle_unavailable', 'indisponibilidade do veículo é respeitada');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', 'b8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000002', null)$$, 'P0001', 'trip_vehicle_not_available', 'veículo de outro tenant é rejeitado');
select throws_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', 'a8200000-0000-4000-8000-000000000002', 'b8100000-0000-4000-8000-000000000001', null)$$, 'P0001', 'trip_driver_not_allocated', 'motorista de outro tenant é rejeitado');
select lives_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000001', 'Atualizada')$$, 'reserva pode ser atualizada atomicamente');
select results_eq($$select notes from public.trip_vehicle_assignments where trip_id = 'a8600000-0000-4000-8000-000000000001'$$, $$values ('Atualizada'::text)$$, 'observação da reserva é atualizada');
select throws_ok($$select public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', '[{"technician_id":"a8100000-0000-4000-8000-000000000003","is_responsible":true}]')$$, 'P0001', 'trip_driver_assigned', 'motorista não pode ser removido da equipe');
select lives_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000003', 'a8200000-0000-4000-8000-000000000002', 'a8100000-0000-4000-8000-000000000002', null)$$, 'veículo pode ser substituído');
select throws_ok($$select public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000003', '[{"technician_id":"a8100000-0000-4000-8000-000000000002","is_responsible":true},{"technician_id":"a8100000-0000-4000-8000-000000000005","is_responsible":false}]')$$, 'P0001', 'trip_vehicle_capacity_exceeded', 'equipe não pode exceder veículo reservado');
select ok(public.remove_trip_vehicle_assignment('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000003'), 'reserva editável pode ser removida');
select lives_ok($$select public.replace_trip_technicians('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000003', '[{"technician_id":"a8100000-0000-4000-8000-000000000002","is_responsible":true},{"technician_id":"a8100000-0000-4000-8000-000000000005","is_responsible":false}]')$$, 'equipe pode crescer após remover reserva');
select throws_ok($$insert into public.vehicle_unavailabilities (organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at, created_by, updated_by) values ('a8000000-0000-4000-8000-000000000001', 'a8200000-0000-4000-8000-000000000001', 'a8700000-0000-4000-8000-000000000001', '2030-08-01 12:00+00', '2030-08-01 13:00+00', '81000000-0000-4000-8000-000000000001', '81000000-0000-4000-8000-000000000001')$$, 'P0001', 'vehicle_has_trip_conflict', 'indisponibilidade não pode conflitar com reserva planejada');
select lives_ok($$select public.cancel_trip('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000001', 'Viagem cancelada para teste')$$, 'cancelamento preserva transporte');
select results_eq($$select blocks_schedule from public.trip_vehicle_assignments where trip_id = 'a8600000-0000-4000-8000-000000000001'$$, $$values (false)$$, 'viagem cancelada libera veículo');
select results_eq($$delete from public.trip_vehicle_assignments where trip_id = 'a8600000-0000-4000-8000-000000000001' returning id$$, $$select null::uuid where false$$, 'reserva histórica não pode ser removida');

reset role;
select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select lives_ok($$select public.assign_trip_vehicle_and_driver('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002', 'a8200000-0000-4000-8000-000000000001', 'a8100000-0000-4000-8000-000000000002', null)$$, 'coordenador pode reservar veículo liberado');
select results_eq('select count(*) from public.trip_vehicle_assignments', 'values (2::bigint)', 'coordenador consulta reservas do tenant');

reset role;
select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_vehicle_assignments', 'values (0::bigint)', 'técnico não consulta reservas administrativas');
select throws_ok($$select public.remove_trip_vehicle_assignment('a8000000-0000-4000-8000-000000000001', 'a8600000-0000-4000-8000-000000000002')$$, 'P0001', 'trip_transport_not_editable', 'técnico não remove reserva');

reset role;
select set_config('request.jwt.claim.sub', '81000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_vehicle_assignments', 'values (0::bigint)', 'usuário bloqueado não consulta reservas');

reset role;
select set_config('request.jwt.claim.sub', '82000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_vehicle_assignments', 'values (0::bigint)', 'outro tenant não consulta reservas');

select * from finish();
rollback;
