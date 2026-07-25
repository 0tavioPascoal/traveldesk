begin;

select plan(38);

select has_table('public', 'trip_required_skills', 'requisitos técnicos devem existir');
select has_table('public', 'trip_technicians', 'equipe da viagem deve existir');
select policies_are('public', 'trip_required_skills', array[
  'trip_required_skills_delete_administrative',
  'trip_required_skills_insert_administrative',
  'trip_required_skills_select_administrative',
  'trip_required_skills_update_administrative'
], 'requisitos devem possuir policies administrativas completas');
select policies_are('public', 'trip_technicians', array[
  'trip_technicians_delete_administrative',
  'trip_technicians_insert_administrative',
  'trip_technicians_select_administrative',
  'trip_technicians_update_administrative'
], 'equipe deve possuir policies administrativas completas');
select has_index('public', 'trip_technicians', 'trip_technicians_one_responsible_key', 'responsável único deve ser protegido por índice');

insert into auth.users (id, email, raw_user_meta_data) values
  ('71000000-0000-4000-8000-000000000001', 'staff-admin-a@example.test', '{}'),
  ('71000000-0000-4000-8000-000000000002', 'staff-coord-a@example.test', '{}'),
  ('71000000-0000-4000-8000-000000000003', 'staff-tech-a@example.test', '{}'),
  ('71000000-0000-4000-8000-000000000004', 'staff-blocked-a@example.test', '{}'),
  ('72000000-0000-4000-8000-000000000001', 'staff-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('a7000000-0000-4000-8000-000000000001', 'Equipe A', 'equipe-a', 'America/Sao_Paulo'),
  ('b7000000-0000-4000-8000-000000000001', 'Equipe B', 'equipe-b', 'America/Sao_Paulo');
insert into public.organization_members (organization_id, profile_id, role, status) values
  ('a7000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('a7000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('a7000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('a7000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000004', 'admin', 'blocked'),
  ('b7000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.skills (id, organization_id, name, active, created_by, updated_by) values
  ('a7100000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'Automação', true, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7100000-0000-4000-8000-000000000002', 'a7000000-0000-4000-8000-000000000001', 'Balança', true, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7100000-0000-4000-8000-000000000003', 'a7000000-0000-4000-8000-000000000001', 'Legada', false, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('b7100000-0000-4000-8000-000000000001', 'b7000000-0000-4000-8000-000000000001', 'Automação', true, '72000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001');

insert into public.technicians (id, organization_id, name, base_city, base_state, active, created_by, updated_by) values
  ('a7200000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'João', 'São Paulo', 'SP', true, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7200000-0000-4000-8000-000000000002', 'a7000000-0000-4000-8000-000000000001', 'Maria', 'Campinas', 'SP', true, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7200000-0000-4000-8000-000000000003', 'a7000000-0000-4000-8000-000000000001', 'Inativo', 'Santos', 'SP', false, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('b7200000-0000-4000-8000-000000000001', 'b7000000-0000-4000-8000-000000000001', 'Técnico B', 'Franca', 'SP', true, '72000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001');
insert into public.technician_skills (organization_id, technician_id, skill_id, proficiency_level, created_by, updated_by) values
  ('a7000000-0000-4000-8000-000000000001', 'a7200000-0000-4000-8000-000000000001', 'a7100000-0000-4000-8000-000000000001', 4, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7000000-0000-4000-8000-000000000001', 'a7200000-0000-4000-8000-000000000002', 'a7100000-0000-4000-8000-000000000002', 2, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001');

insert into public.clients (id, organization_id, legal_name, created_by, updated_by) values
  ('a7300000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'Cliente A Ltda', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('b7300000-0000-4000-8000-000000000001', 'b7000000-0000-4000-8000-000000000001', 'Cliente B Ltda', '72000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('a7400000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'a7300000-0000-4000-8000-000000000001', 'Unidade A', 'Ribeirão Preto', 'SP', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('b7400000-0000-4000-8000-000000000001', 'b7000000-0000-4000-8000-000000000001', 'b7300000-0000-4000-8000-000000000001', 'Unidade B', 'Franca', 'SP', '72000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001');
insert into public.service_types (id, organization_id, name, created_by, updated_by) values
  ('a7500000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'Implantação', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('b7500000-0000-4000-8000-000000000001', 'b7000000-0000-4000-8000-000000000001', 'Implantação', '72000000-0000-4000-8000-000000000001', '72000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.trips (
  id, organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_legal_name_snapshot, client_unit_name_snapshot,
  title, status, travel_starts_at, travel_ends_at, service_starts_at,
  service_ends_at, origin_city, origin_state, destination_city,
  destination_state, created_by, updated_by
) values
  ('a7600000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'IGNORADO', 'a7300000-0000-4000-8000-000000000001', 'a7400000-0000-4000-8000-000000000001', 'a7500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem planejada', 'planned', '2030-08-01 11:00+00', '2030-08-01 21:00+00', '2030-08-01 12:00+00', '2030-08-01 20:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7600000-0000-4000-8000-000000000002', 'a7000000-0000-4000-8000-000000000001', 'IGNORADO', 'a7300000-0000-4000-8000-000000000001', 'a7400000-0000-4000-8000-000000000001', 'a7500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem rascunho', 'draft', '2030-08-02 11:00+00', '2030-08-02 21:00+00', '2030-08-02 12:00+00', '2030-08-02 20:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7600000-0000-4000-8000-000000000003', 'a7000000-0000-4000-8000-000000000001', 'IGNORADO', 'a7300000-0000-4000-8000-000000000001', 'a7400000-0000-4000-8000-000000000001', 'a7500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem sobreposta', 'draft', '2030-08-01 20:00+00', '2030-08-02 02:00+00', '2030-08-01 20:00+00', '2030-08-02 01:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7600000-0000-4000-8000-000000000004', 'a7000000-0000-4000-8000-000000000001', 'IGNORADO', 'a7300000-0000-4000-8000-000000000001', 'a7400000-0000-4000-8000-000000000001', 'a7500000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem encostada', 'draft', '2030-08-01 21:00+00', '2030-08-02 02:00+00', '2030-08-01 21:00+00', '2030-08-02 01:00+00', 'São Paulo', 'SP', 'Ribeirão Preto', 'SP', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001'),
  ('a7600000-0000-4000-8000-000000000005', 'a7000000-0000-4000-8000-000000000001', 'IGNORADO', 'a7300000-0000-4000-8000-000000000001', 'a7400000-0000-4000-8000-000000000001', null, 'Ignorado', 'Ignorado', 'Ignorada', 'Viagem sem período', 'draft', null, null, null, null, null, null, null, null, '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001');

set local role authenticated;

select ok(public.replace_trip_required_skills(
  'a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001',
  '[{"skill_id":"a7100000-0000-4000-8000-000000000001","minimum_proficiency_level":3,"notes":null},{"skill_id":"a7100000-0000-4000-8000-000000000002","minimum_proficiency_level":4,"notes":"Obrigatória"}]'::jsonb
), 'admin substitui requisitos');
select results_eq($$select count(*) from public.trip_required_skills where trip_id = 'a7600000-0000-4000-8000-000000000001'$$, 'values (2::bigint)', 'dois requisitos persistidos');
select throws_ok($$select public.replace_trip_required_skills('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', '[{"skill_id":"a7100000-0000-4000-8000-000000000003","minimum_proficiency_level":3}]'::jsonb)$$, 'P0001', 'trip_skill_not_available', 'especialidade inativa não é adicionada');
select throws_ok($$select public.replace_trip_required_skills('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', '[{"skill_id":"a7100000-0000-4000-8000-000000000001","minimum_proficiency_level":3},{"skill_id":"a7100000-0000-4000-8000-000000000001","minimum_proficiency_level":4}]'::jsonb)$$, 'P0001', 'trip_invalid_requirements', 'requisito duplicado falha');
select throws_ok($$select public.replace_trip_required_skills('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', '[{"skill_id":"b7100000-0000-4000-8000-000000000001","minimum_proficiency_level":3}]'::jsonb)$$, 'P0001', 'trip_skill_not_available', 'especialidade de outro tenant falha');

select ok(public.replace_trip_technicians(
  'a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001',
  '[{"technician_id":"a7200000-0000-4000-8000-000000000001","is_responsible":true,"notes":null}]'::jsonb
), 'admin aloca técnico em planejada');
select results_eq($$select blocks_schedule, is_responsible from public.trip_technicians where trip_id = 'a7600000-0000-4000-8000-000000000001'$$, 'values (true, true)', 'planejada bloqueia agenda e possui responsável');
select results_eq($$select created_by, updated_by from public.trip_technicians where trip_id = 'a7600000-0000-4000-8000-000000000001'$$, $$values ('71000000-0000-4000-8000-000000000001'::uuid, '71000000-0000-4000-8000-000000000001'::uuid)$$, 'auditoria deve usar o usuário autenticado');
select results_eq($$select count(*) from public.trip_required_skills requirement join public.trip_technicians allocation using (organization_id, trip_id) join public.technician_skills skill on skill.organization_id = allocation.organization_id and skill.technician_id = allocation.technician_id and skill.skill_id = requirement.skill_id where requirement.trip_id = 'a7600000-0000-4000-8000-000000000001' and skill.proficiency_level >= requirement.minimum_proficiency_level$$, 'values (1::bigint)', 'um de dois requisitos está coberto');
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000003', '[{"technician_id":"a7200000-0000-4000-8000-000000000001","is_responsible":false}]'::jsonb)$$, 'P0001', 'trip_technician_schedule_conflict', 'viagem sobreposta falha');
select ok(public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000004', '[{"technician_id":"a7200000-0000-4000-8000-000000000001","is_responsible":false}]'::jsonb), 'período encostado é permitido');
select public.mark_trip_as_planned('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000004');
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000002', '[{"technician_id":"a7200000-0000-4000-8000-000000000003","is_responsible":false}]'::jsonb)$$, 'P0001', 'trip_technician_not_available', 'técnico inativo não é adicionado');
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000002', '[{"technician_id":"b7200000-0000-4000-8000-000000000001","is_responsible":false}]'::jsonb)$$, 'P0001', 'trip_technician_not_available', 'técnico de outro tenant falha');
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000002', '[{"technician_id":"a7200000-0000-4000-8000-000000000002","is_responsible":true},{"technician_id":"a7200000-0000-4000-8000-000000000001","is_responsible":true}]'::jsonb)$$, 'P0001', 'trip_invalid_team', 'dois responsáveis falham');
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000005', '[{"technician_id":"a7200000-0000-4000-8000-000000000001","is_responsible":false}]'::jsonb)$$, 'P0001', 'trip_period_required', 'viagem sem período não recebe equipe');

reset role;
insert into public.technician_unavailability_types (id, organization_id, name, created_by, updated_by)
values ('a7700000-0000-4000-8000-000000000001', 'a7000000-0000-4000-8000-000000000001', 'Folga', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001');
insert into public.technician_unavailabilities (organization_id, technician_id, unavailability_type_id, starts_at, ends_at, created_by, updated_by)
values ('a7000000-0000-4000-8000-000000000001', 'a7200000-0000-4000-8000-000000000002', 'a7700000-0000-4000-8000-000000000001', '2030-08-02 15:00+00', '2030-08-02 16:00+00', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001');
set local role authenticated;
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000002', '[{"technician_id":"a7200000-0000-4000-8000-000000000002","is_responsible":false}]'::jsonb)$$, 'P0001', 'trip_technician_unavailable', 'indisponibilidade bloqueia alocação');
select throws_ok($$insert into public.technician_unavailabilities (organization_id, technician_id, unavailability_type_id, starts_at, ends_at, created_by, updated_by) values ('a7000000-0000-4000-8000-000000000001', 'a7200000-0000-4000-8000-000000000001', 'a7700000-0000-4000-8000-000000000001', '2030-08-01 15:00+00', '2030-08-01 16:00+00', '71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000001')$$, 'P0001', 'technician_has_trip_conflict', 'indisponibilidade não sobrepõe viagem planejada');

select ok(public.set_trip_responsible_technician('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', null), 'responsável pode ser removido');
select results_eq($$select count(*) from public.trip_technicians where trip_id = 'a7600000-0000-4000-8000-000000000001' and is_responsible$$, 'values (0::bigint)', 'viagem pode ficar sem responsável');
select throws_ok($$select public.set_trip_responsible_technician('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', 'a7200000-0000-4000-8000-000000000002')$$, 'P0001', 'trip_responsible_not_allocated', 'responsável deve estar na equipe');
select ok(public.set_trip_responsible_technician('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', 'a7200000-0000-4000-8000-000000000001'), 'responsável alocado pode ser definido');

select throws_ok($$update public.trips set travel_starts_at = '2030-08-01 20:30+00', travel_ends_at = '2030-08-01 23:00+00', service_starts_at = '2030-08-01 21:00+00', service_ends_at = '2030-08-01 22:00+00', updated_by = '71000000-0000-4000-8000-000000000001' where id = 'a7600000-0000-4000-8000-000000000001'$$, 'P0001', 'trip_technician_schedule_conflict', 'mudança de período revalida outras viagens');
select lives_ok($$select public.return_trip_to_draft('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001')$$, 'retornar para rascunho libera agenda');
select results_eq($$select blocks_schedule from public.trip_technicians where trip_id = 'a7600000-0000-4000-8000-000000000001'$$, 'values (false)', 'rascunho não bloqueia agenda');
select lives_ok($$select public.cancel_trip('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000001', 'Cancelada para teste de histórico')$$, 'viagem pode ser cancelada');
select throws_ok($$delete from public.trip_technicians where trip_id = 'a7600000-0000-4000-8000-000000000001'$$, 'P0001', 'trip_not_editable', 'cancelada preserva equipe');
select throws_ok($$delete from public.trip_required_skills where trip_id = 'a7600000-0000-4000-8000-000000000001'$$, 'P0001', 'trip_not_editable', 'cancelada preserva requisitos');

reset role;
select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select ok(public.replace_trip_required_skills('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000002', '[]'::jsonb), 'coordenador gerencia requisitos');
select results_eq('select count(*) from public.trip_technicians', 'values (2::bigint)', 'coordenador consulta equipes do tenant');

reset role;
select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_technicians', 'values (0::bigint)', 'técnico não consulta equipes administrativas');
select throws_ok($$select public.replace_trip_technicians('a7000000-0000-4000-8000-000000000001', 'a7600000-0000-4000-8000-000000000002', '[]'::jsonb)$$, 'P0001', 'trip_not_editable', 'técnico não gerencia equipe');

reset role;
select set_config('request.jwt.claim.sub', '71000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_required_skills', 'values (0::bigint)', 'usuário bloqueado não consulta requisitos');

reset role;
select set_config('request.jwt.claim.sub', '72000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_technicians', 'values (0::bigint)', 'outro tenant não consulta equipe');

select * from finish();
rollback;
