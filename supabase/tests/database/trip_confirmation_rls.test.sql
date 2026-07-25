begin;

select plan(36);

select has_column('public', 'trips', 'confirmed_at', 'viagem registra data da confirmação');
select has_column('public', 'trips', 'confirmed_by', 'viagem registra autor da confirmação');
select has_function('public', 'confirm_trip', array['uuid', 'uuid'], 'RPC transacional de confirmação existe');

insert into auth.users (id, email, raw_user_meta_data) values
  ('a1000000-0000-4000-8000-000000000001', 'confirmation-admin-a@example.test', '{}'),
  ('a1000000-0000-4000-8000-000000000002', 'confirmation-tech-a@example.test', '{}'),
  ('b1000000-0000-4000-8000-000000000001', 'confirmation-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('a1100000-0000-4000-8000-000000000001', 'Confirmação A', 'confirmacao-a', 'America/Sao_Paulo'),
  ('b1100000-0000-4000-8000-000000000001', 'Confirmação B', 'confirmacao-b', 'America/Sao_Paulo');
insert into public.organization_members (organization_id, profile_id, role, status) values
  ('a1100000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('a1100000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000002', 'technician', 'active'),
  ('b1100000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.clients (id, organization_id, legal_name, created_by, updated_by) values
  ('a1200000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'Cliente Confirmação', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('a1300000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'a1200000-0000-4000-8000-000000000001', 'Unidade Confirmação', 'Ribeirão Preto', 'SP', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');
insert into public.service_types (id, organization_id, name, created_by, updated_by) values
  ('a1400000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'Implantação', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');
insert into public.skills (id, organization_id, name, created_by, updated_by) values
  ('a1500000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'Balança', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');
insert into public.technicians (
  id, organization_id, name, base_city, base_state, driver_license_number,
  driver_license_category, driver_license_expires_at,
  can_drive_company_vehicle, created_by, updated_by
) values
  ('a1600000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'Motorista', 'São Paulo', 'SP', '12345678901', 'B', '2035-12-31', true, 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a1600000-0000-4000-8000-000000000002', 'a1100000-0000-4000-8000-000000000001', 'Ajudante', 'São Paulo', 'SP', null, null, null, false, 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');
insert into public.vehicles (
  id, organization_id, plate, brand, model, passenger_capacity, base_city,
  base_state, operational_status, created_by, updated_by
) values (
  'a1700000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001',
  'CNF1A23', 'Fiat', 'Cronos', 2, 'São Paulo', 'SP', 'available',
  'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'
);

select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.trips (
  id, organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_legal_name_snapshot, client_unit_name_snapshot,
  title, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, created_by, updated_by
) values
  ('a1800000-0000-4000-8000-000000000001', 'a1100000-0000-4000-8000-000000000001', 'IGNORADO', 'a1200000-0000-4000-8000-000000000001', 'a1300000-0000-4000-8000-000000000001', 'a1400000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem pronta', 'planned', '2030-08-10 10:00+00', '2030-08-12 23:00+00', '2030-08-10 13:00+00', '2030-08-12 20:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001'),
  ('a1800000-0000-4000-8000-000000000002', 'a1100000-0000-4000-8000-000000000001', 'IGNORADO', 'a1200000-0000-4000-8000-000000000001', 'a1300000-0000-4000-8000-000000000001', 'a1400000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Rascunho', 'draft', '2030-09-10 10:00+00', '2030-09-10 23:00+00', '2030-09-10 13:00+00', '2030-09-10 20:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');

set local role authenticated;

select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000002')$$, 'P0001', 'trip_confirmation_not_planned', 'rascunho não pode ser confirmado');
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_team_required', 'confirmação exige equipe');

select public.replace_trip_technicians(
  'a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001',
  '[{"technician_id":"a1600000-0000-4000-8000-000000000001","is_responsible":false},{"technician_id":"a1600000-0000-4000-8000-000000000002","is_responsible":false}]'
);
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_responsible_required', 'confirmação exige exatamente um responsável');
select public.set_trip_responsible_technician('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', 'a1600000-0000-4000-8000-000000000001');
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_transport_required', 'confirmação exige transporte');
select public.assign_trip_vehicle_and_driver('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', 'a1700000-0000-4000-8000-000000000001', 'a1600000-0000-4000-8000-000000000001', null);
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_overnights_not_reviewed', 'confirmação exige revisão dos pernoites');
select public.review_trip_overnights('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', 1);

update public.client_units set active = false, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1300000-0000-4000-8000-000000000001';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_unit_inactive', 'unidade inativa bloqueia confirmação');
update public.clients set active = false, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1200000-0000-4000-8000-000000000001';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_client_inactive', 'cliente inativo bloqueia confirmação');
update public.clients set active = true, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1200000-0000-4000-8000-000000000001';
update public.client_units set active = true, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1300000-0000-4000-8000-000000000001';
update public.service_types set active = false, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1400000-0000-4000-8000-000000000001';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_service_type_inactive', 'tipo inativo bloqueia confirmação');
update public.service_types set active = true, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1400000-0000-4000-8000-000000000001';

update public.technicians set active = false, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1600000-0000-4000-8000-000000000002';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_technician_inactive', 'técnico inativo bloqueia confirmação');
update public.technicians set active = true, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1600000-0000-4000-8000-000000000002';
update public.vehicles set operational_status = 'maintenance', updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1700000-0000-4000-8000-000000000001';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_vehicle_not_available', 'veículo em manutenção bloqueia confirmação');
update public.vehicles set operational_status = 'available', updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1700000-0000-4000-8000-000000000001';
update public.vehicles set passenger_capacity = 1, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1700000-0000-4000-8000-000000000001';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_vehicle_capacity_exceeded', 'capacidade insuficiente bloqueia confirmação');
update public.vehicles set passenger_capacity = 2, updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1700000-0000-4000-8000-000000000001';
update public.technicians set driver_license_expires_at = '2029-12-31', updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1600000-0000-4000-8000-000000000001';
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_driver_license_expired', 'CNH inválida no fim da viagem bloqueia confirmação');
update public.technicians set driver_license_expires_at = '2035-12-31', updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1600000-0000-4000-8000-000000000001';

select public.replace_trip_required_skills('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', '[{"skill_id":"a1500000-0000-4000-8000-000000000001","minimum_proficiency_level":4}]');
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_skill_coverage_incomplete', 'cobertura incompleta bloqueia confirmação');
reset role;
insert into public.technician_skills (organization_id, technician_id, skill_id, proficiency_level, is_primary, created_by, updated_by)
values ('a1100000-0000-4000-8000-000000000001', 'a1600000-0000-4000-8000-000000000002', 'a1500000-0000-4000-8000-000000000001', 4, true, 'a1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001');
set local role authenticated;

select ok(public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001'), 'viagem pronta é confirmada atomicamente');
select results_eq($$select status from public.trips where id = 'a1800000-0000-4000-8000-000000000001'$$, $$values ('confirmed'::public.trip_status)$$, 'status passa para confirmada');
select results_eq($$select confirmed_by, confirmed_at is not null from public.trips where id = 'a1800000-0000-4000-8000-000000000001'$$, $$values ('a1000000-0000-4000-8000-000000000001'::uuid, true)$$, 'auditoria de confirmação vem da autenticação');
select results_eq($$select (confirmed_at is null) = (confirmed_by is null) from public.trips where id = 'a1800000-0000-4000-8000-000000000001'$$, $$values (true)$$, 'auditoria de confirmação permanece consistente');
select results_eq($$select bool_and(blocks_schedule) from public.trip_technicians where trip_id = 'a1800000-0000-4000-8000-000000000001'$$, $$values (true)$$, 'confirmação mantém técnicos ocupados');
select results_eq($$select blocks_schedule from public.trip_vehicle_assignments where trip_id = 'a1800000-0000-4000-8000-000000000001'$$, $$values (true)$$, 'confirmação mantém veículo reservado');
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmation_not_planned', 'confirmação duplicada é rejeitada');
select throws_ok($$update public.trips set title = 'Alterada', updated_by = 'a1000000-0000-4000-8000-000000000001' where id = 'a1800000-0000-4000-8000-000000000001'$$, 'P0001', 'trip_not_editable', 'dados principais confirmados são imutáveis');
select throws_ok($$select public.replace_trip_technicians('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', '[]')$$, 'P0001', 'trip_not_editable', 'equipe confirmada é imutável');
select throws_ok($$select public.replace_trip_required_skills('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', '[]')$$, 'P0001', 'trip_not_editable', 'requisitos confirmados são imutáveis');
select throws_ok($$select public.set_trip_responsible_technician('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', null)$$, 'P0001', 'trip_not_editable', 'responsável confirmado é imutável');
select throws_ok($$select public.remove_trip_vehicle_assignment('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_transport_not_editable', 'transporte confirmado é imutável');
select throws_ok($$select public.adjust_trip_overnights('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', 3, 'Ajuste indevido após confirmação', 2)$$, 'P0001', 'trip_overnight_not_editable', 'pernoites confirmados são imutáveis');

reset role;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000002')$$, 'P0001', 'trip_confirmation_not_found', 'técnico não confirma nem descobre a viagem');
reset role;
select set_config('request.jwt.claim.sub', 'b1000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select throws_ok($$select public.confirm_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000002')$$, 'P0001', 'trip_confirmation_not_found', 'outro tenant não confirma nem descobre a viagem');

reset role;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select ok(public.cancel_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001', 'Cancelamento operacional confirmado'), 'viagem confirmada pode ser cancelada');
select results_eq($$select status, confirmed_at is not null, confirmed_by from public.trips where id = 'a1800000-0000-4000-8000-000000000001'$$, $$values ('canceled'::public.trip_status, true, 'a1000000-0000-4000-8000-000000000001'::uuid)$$, 'cancelamento preserva auditoria da confirmação');
select results_eq($$select (select bool_and(not blocks_schedule) from public.trip_technicians where trip_id = 'a1800000-0000-4000-8000-000000000001'), (select not blocks_schedule from public.trip_vehicle_assignments where trip_id = 'a1800000-0000-4000-8000-000000000001')$$, $$values (true, true)$$, 'cancelamento libera agendas');
select results_eq($$select (select count(*) from public.trip_technicians where trip_id = 'a1800000-0000-4000-8000-000000000001'), (select count(*) from public.trip_vehicle_assignments where trip_id = 'a1800000-0000-4000-8000-000000000001'), (select count(*) from public.trip_overnights where trip_id = 'a1800000-0000-4000-8000-000000000001')$$, $$values (2::bigint, 1::bigint, 1::bigint)$$, 'cancelamento preserva equipe, transporte e pernoites');
select throws_ok($$select public.restore_canceled_trip('a1100000-0000-4000-8000-000000000001', 'a1800000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_confirmed_restore_forbidden', 'viagem confirmada cancelada não pode ser restaurada');

select * from finish();
rollback;
