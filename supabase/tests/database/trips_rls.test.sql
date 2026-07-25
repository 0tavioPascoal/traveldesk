begin;

select plan(30);

select has_table('public', 'trips', 'tabela de viagens deve existir');
select enum_has_labels('public', 'trip_priority', array['low', 'normal', 'high', 'urgent'], 'prioridades esperadas');
select enum_has_labels('public', 'trip_status', array['draft', 'planned', 'confirmed', 'traveling', 'at_client', 'in_service', 'returning', 'finished', 'canceled'], 'status esperados');
select policies_are('public', 'trips', array[
  'trips_insert_administrative',
  'trips_select_administrative',
  'trips_update_administrative'
], 'viagens devem ter somente policies administrativas');

insert into auth.users (id, email, raw_user_meta_data) values
  ('61000000-0000-4000-8000-000000000001', 'trip-admin-a@example.test', '{}'),
  ('61000000-0000-4000-8000-000000000002', 'trip-coord-a@example.test', '{}'),
  ('61000000-0000-4000-8000-000000000003', 'trip-tech-a@example.test', '{}'),
  ('61000000-0000-4000-8000-000000000004', 'trip-blocked-a@example.test', '{}'),
  ('62000000-0000-4000-8000-000000000001', 'trip-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('a6000000-0000-4000-8000-000000000001', 'Viagens A', 'viagens-a', 'America/Sao_Paulo'),
  ('b6000000-0000-4000-8000-000000000001', 'Viagens B', 'viagens-b', 'America/Sao_Paulo');

insert into public.organization_members (organization_id, profile_id, role, status) values
  ('a6000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('a6000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('a6000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('a6000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000004', 'admin', 'blocked'),
  ('b6000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.clients (id, organization_id, legal_name, trade_name, created_by, updated_by) values
  ('a6100000-0000-4000-8000-000000000001', 'a6000000-0000-4000-8000-000000000001', 'Cliente A Ltda', 'Cliente A', '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'),
  ('b6100000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000001', 'Cliente B Ltda', 'Cliente B', '62000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('a6200000-0000-4000-8000-000000000001', 'a6000000-0000-4000-8000-000000000001', 'a6100000-0000-4000-8000-000000000001', 'Unidade A', 'Ribeirão Preto', 'SP', '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'),
  ('b6200000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000001', 'b6100000-0000-4000-8000-000000000001', 'Unidade B', 'Franca', 'SP', '62000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001');
insert into public.service_types (id, organization_id, name, created_by, updated_by) values
  ('a6300000-0000-4000-8000-000000000001', 'a6000000-0000-4000-8000-000000000001', 'Implantação', '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'),
  ('b6300000-0000-4000-8000-000000000001', 'b6000000-0000-4000-8000-000000000001', 'Implantação', '62000000-0000-4000-8000-000000000001', '62000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok($$insert into public.trips (
  organization_id, code, client_id, client_unit_id, client_name_snapshot,
  client_unit_name_snapshot, title, created_by, updated_by
) values (
  'a6000000-0000-4000-8000-000000000001', 'IGNORADO',
  'a6100000-0000-4000-8000-000000000001', 'a6200000-0000-4000-8000-000000000001',
  'Ignorado', 'Ignorada', 'Rascunho inicial',
  '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'
)$$, 'admin cadastra rascunho');
select results_eq($$select count(*) from public.trips where code ~ '^VGM-[0-9]{4}-[0-9]{6,}$'$$, 'values (1::bigint)', 'código deve ser gerado pelo banco');
select results_eq(
  $$select client_name_snapshot, client_legal_name_snapshot, client_trade_name_snapshot, client_unit_name_snapshot from public.trips limit 1$$,
  $$values ('Cliente A'::text, 'Cliente A Ltda'::text, 'Cliente A'::text, 'Unidade A'::text)$$,
  'snapshots devem vir das referências'
);
select results_eq($$select destination_city, destination_state from public.trips limit 1$$, $$values ('Ribeirão Preto'::text, 'SP'::text)$$, 'destino deve usar a unidade por padrão');

select throws_ok($$insert into public.trips (
  organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_unit_name_snapshot, title, status, created_by, updated_by
) values (
  'a6000000-0000-4000-8000-000000000001', 'IGNORADO',
  'a6100000-0000-4000-8000-000000000001', 'a6200000-0000-4000-8000-000000000001',
  'a6300000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorada', 'Planejada incompleta',
  'planned', '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'
)$$, '23514', null, 'planejada incompleta deve falhar');

select lives_ok($$insert into public.trips (
  organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_unit_name_snapshot, title, status,
  travel_starts_at, travel_ends_at, service_starts_at, service_ends_at,
  origin_city, origin_state, destination_city, destination_state, created_by, updated_by
) values (
  'a6000000-0000-4000-8000-000000000001', 'IGNORADO',
  'a6100000-0000-4000-8000-000000000001', 'a6200000-0000-4000-8000-000000000001',
  'a6300000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorada', 'Viagem planejada', 'planned',
  '2030-08-01 10:00+00', '2030-08-02 20:00+00', '2030-08-01 13:00+00', '2030-08-02 18:00+00',
  'São Paulo', 'SP', 'Ribeirão Preto', 'SP',
  '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'
)$$, 'viagem completa pode nascer planejada');
select isnt((select min(code) from public.trips), (select max(code) from public.trips), 'códigos gerados devem ser distintos');

select throws_ok($$insert into public.trips (
  organization_id, code, client_id, client_unit_id, client_name_snapshot,
  client_unit_name_snapshot, title, created_by, updated_by
) values (
  'a6000000-0000-4000-8000-000000000001', 'IGNORADO',
  'a6100000-0000-4000-8000-000000000001', 'b6200000-0000-4000-8000-000000000001',
  'Ignorado', 'Ignorada', 'Unidade externa',
  '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'
)$$, 'P0001', 'trip_unit_not_available', 'unidade de outro tenant deve falhar');
select throws_ok($$insert into public.trips (
  organization_id, code, client_id, client_unit_id, service_type_id,
  client_name_snapshot, client_unit_name_snapshot, title, created_by, updated_by
) values (
  'a6000000-0000-4000-8000-000000000001', 'IGNORADO',
  'a6100000-0000-4000-8000-000000000001', 'a6200000-0000-4000-8000-000000000001',
  'b6300000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorada', 'Tipo externo',
  '61000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001'
)$$, 'P0001', 'trip_service_type_not_available', 'tipo de outro tenant deve falhar');
select throws_ok($$update public.trips set travel_starts_at = '2030-01-02 10:00+00', travel_ends_at = '2030-01-01 10:00+00', updated_by = '61000000-0000-4000-8000-000000000001' where title = 'Rascunho inicial'$$, '23514', null, 'período invertido deve falhar');
select throws_ok($$update public.trips set travel_starts_at = '2030-01-01 10:00+00', travel_ends_at = '2030-01-02 10:00+00', service_starts_at = '2030-01-01 09:00+00', service_ends_at = '2030-01-01 12:00+00', updated_by = '61000000-0000-4000-8000-000000000001' where title = 'Rascunho inicial'$$, '23514', null, 'atendimento fora da viagem deve falhar');
select lives_ok($$with changed as (update public.trips set service_type_id = 'a6300000-0000-4000-8000-000000000001', travel_starts_at = '2030-01-01 10:00+00', travel_ends_at = '2030-01-02 10:00+00', service_starts_at = '2030-01-01 12:00+00', service_ends_at = '2030-01-01 18:00+00', origin_city = 'São Paulo', origin_state = 'SP', updated_by = '61000000-0000-4000-8000-000000000001' where title = 'Rascunho inicial' returning id) select public.mark_trip_as_planned('a6000000-0000-4000-8000-000000000001', id) from changed$$, 'rascunho completo pode ser planejado');
select lives_ok($$select public.return_trip_to_draft('a6000000-0000-4000-8000-000000000001', (select id from public.trips where title = 'Rascunho inicial'))$$, 'planejada pode voltar a rascunho');
select throws_ok($$select public.cancel_trip('a6000000-0000-4000-8000-000000000001', (select id from public.trips where title = 'Rascunho inicial'), 'não')$$, 'P0001', 'trip_cancellation_reason_required', 'cancelamento exige motivo');
select lives_ok($$select public.cancel_trip('a6000000-0000-4000-8000-000000000001', (select id from public.trips where title = 'Rascunho inicial'), 'Solicitação cancelada pelo cliente')$$, 'admin cancela viagem');
select results_eq($$select count(*) from public.trips where title = 'Rascunho inicial' and canceled_at is not null and canceled_by = '61000000-0000-4000-8000-000000000001'$$, 'values (1::bigint)', 'cancelamento deve registrar auditoria');
select results_eq($$select public.cancel_trip('a6000000-0000-4000-8000-000000000001', (select id from public.trips where title = 'Rascunho inicial'), 'Cancelar novamente')$$, $$values (false)$$, 'cancelamento duplicado deve falhar');
select throws_ok($$delete from public.trips where title = 'Viagem planejada'$$, '42501', null, 'delete deve ser proibido');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select results_eq('select count(*) from public.trips', 'values (2::bigint)', 'coordenador consulta viagens do tenant');
select throws_ok($$select public.restore_canceled_trip('a6000000-0000-4000-8000-000000000001', (select id from public.trips where title = 'Rascunho inicial'))$$, 'P0001', 'trip_restore_forbidden', 'coordenador não restaura cancelada');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok($$select public.restore_canceled_trip('a6000000-0000-4000-8000-000000000001', (select id from public.trips where title = 'Rascunho inicial'))$$, 'admin restaura cancelada');
select results_eq($$select count(*) from public.trips where title = 'Rascunho inicial' and status = 'draft' and canceled_at is null$$, 'values (1::bigint)', 'restauração limpa dados de cancelamento');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq('select count(*) from public.trips', 'values (0::bigint)', 'técnico não consulta viagens');
select throws_ok($$insert into public.trips (organization_id, code, client_id, client_unit_id, client_name_snapshot, client_unit_name_snapshot, title, created_by, updated_by) values ('a6000000-0000-4000-8000-000000000001', 'IGNORADO', 'a6100000-0000-4000-8000-000000000001', 'a6200000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorada', 'Técnico não cria', '61000000-0000-4000-8000-000000000003', '61000000-0000-4000-8000-000000000003')$$, '42501', null, 'técnico não cadastra viagem');

reset role;
select set_config('request.jwt.claim.sub', '61000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select results_eq('select count(*) from public.trips', 'values (0::bigint)', 'usuário bloqueado não consulta viagens');

reset role;
update public.organizations set active = false where id = 'b6000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub', '62000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq('select count(*) from public.trips', 'values (0::bigint)', 'organização inativa não consulta viagens');

select * from finish();
rollback;
