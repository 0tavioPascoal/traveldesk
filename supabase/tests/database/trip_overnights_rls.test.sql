begin;
select plan(35);

select has_table('public', 'trip_overnights', 'tabela de pernoites existe');
select policies_are('public', 'trip_overnights', array[
  'trip_overnights_select_administrative'
], 'somente leitura administrativa possui policy direta');
select has_column('public', 'trip_overnights', 'calculated_overnights', 'cálculo automático existe');
select has_column('public', 'trip_overnights', 'adjusted_overnights', 'ajuste opcional existe');
select has_index('public', 'trip_overnights', 'trip_overnights_trip_key', 'uma linha por viagem');

insert into auth.users (id, email, raw_user_meta_data) values
  ('91000000-0000-4000-8000-000000000001', 'overnight-admin-a@example.test', '{}'),
  ('91000000-0000-4000-8000-000000000002', 'overnight-coord-a@example.test', '{}'),
  ('91000000-0000-4000-8000-000000000003', 'overnight-tech-a@example.test', '{}'),
  ('91000000-0000-4000-8000-000000000004', 'overnight-blocked-a@example.test', '{}'),
  ('92000000-0000-4000-8000-000000000001', 'overnight-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('a9000000-0000-4000-8000-000000000001', 'Pernoites A', 'pernoites-a', 'America/Sao_Paulo'),
  ('b9000000-0000-4000-8000-000000000001', 'Pernoites B', 'pernoites-b', 'America/Sao_Paulo');
insert into public.organization_members (organization_id, profile_id, role, status) values
  ('a9000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('a9000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('a9000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('a9000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000004', 'admin', 'blocked'),
  ('b9000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.clients (id, organization_id, legal_name, created_by, updated_by) values
  ('a9100000-0000-4000-8000-000000000001', 'a9000000-0000-4000-8000-000000000001', 'Cliente A', '91000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001'),
  ('b9100000-0000-4000-8000-000000000001', 'b9000000-0000-4000-8000-000000000001', 'Cliente B', '92000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001');
insert into public.client_units (id, organization_id, client_id, name, city, state, created_by, updated_by) values
  ('a9200000-0000-4000-8000-000000000001', 'a9000000-0000-4000-8000-000000000001', 'a9100000-0000-4000-8000-000000000001', 'Unidade A', 'Ribeirão Preto', 'SP', '91000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001'),
  ('b9200000-0000-4000-8000-000000000001', 'b9000000-0000-4000-8000-000000000001', 'b9100000-0000-4000-8000-000000000001', 'Unidade B', 'Franca', 'SP', '92000000-0000-4000-8000-000000000001', '92000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

insert into public.trips (
  id, organization_id, code, client_id, client_unit_id,
  client_name_snapshot, client_legal_name_snapshot, client_unit_name_snapshot,
  title, travel_starts_at, travel_ends_at, created_by, updated_by
) values
  ('a9300000-0000-4000-8000-000000000001', 'a9000000-0000-4000-8000-000000000001', 'IGNORADO', 'a9100000-0000-4000-8000-000000000001', 'a9200000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Mesmo dia', '2030-08-10 10:00+00', '2030-08-11 00:59+00', '91000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001'),
  ('a9300000-0000-4000-8000-000000000002', 'a9000000-0000-4000-8000-000000000001', 'IGNORADO', 'a9100000-0000-4000-8000-000000000001', 'a9200000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Vários dias', '2030-08-10 10:00+00', '2030-08-12 23:00+00', '91000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001'),
  ('a9300000-0000-4000-8000-000000000003', 'a9000000-0000-4000-8000-000000000001', 'IGNORADO', 'a9100000-0000-4000-8000-000000000001', 'a9200000-0000-4000-8000-000000000001', 'Ignorado', 'Ignorado', 'Ignorada', 'Sem período', null, null, '91000000-0000-4000-8000-000000000001', '91000000-0000-4000-8000-000000000001');

set local role authenticated;

select results_eq($$select calculated_overnights from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000001'$$, $$values (0)$$, 'mesma data local resulta em zero');
select results_eq($$select calculated_overnights from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (2)$$, 'diferença de datas locais resulta em dois');
select results_eq($$select count(*) from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000003'$$, $$values (0::bigint)$$, 'rascunho sem período não calcula');
select results_eq($$select calculation_timezone from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values ('America/Sao_Paulo'::text)$$, 'timezone fica registrado');
select results_eq($$select reviewed_at is null from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (true)$$, 'novo cálculo aguarda revisão');

select ok(public.review_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 1), 'admin revisa cálculo');
select results_eq($$select reviewed_by from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values ('91000000-0000-4000-8000-000000000001'::uuid)$$, 'revisor vem da autenticação');
select ok(public.adjust_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 3, 'Permanência adicional', 2), 'admin ajusta pernoites');
select results_eq($$select coalesce(adjusted_overnights, calculated_overnights) from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (3)$$, 'valor efetivo usa ajuste');
select results_eq($$select adjustment_reason from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values ('Permanência adicional'::text)$$, 'justificativa normalizada é preservada');
select throws_ok($$select public.adjust_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', -1, 'Valor inválido', 3)$$, 'P0001', 'trip_overnight_invalid_adjustment', 'quantidade negativa é rejeitada');
select throws_ok($$select public.adjust_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 4, 'não', 3)$$, 'P0001', 'trip_overnight_adjustment_reason_required', 'justificativa curta é rejeitada');
select ok(public.adjust_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 2, 'Igual ao automático', 3), 'valor igual restaura automático');
select results_eq($$select adjusted_overnights from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (null::integer)$$, 'override igual ao automático é removido');
select throws_ok($$select public.review_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 3)$$, 'P0001', 'trip_overnight_stale', 'revisão antiga é rejeitada');

select ok(public.adjust_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 4, 'Hospedagem antecipada', 4), 'novo ajuste é salvo');
update public.trips set travel_ends_at = '2030-08-13 23:00+00', updated_by = '91000000-0000-4000-8000-000000000001' where id = 'a9300000-0000-4000-8000-000000000002';
select results_eq($$select calculated_overnights, adjusted_overnights, reviewed_at from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (3, null::integer, null::timestamptz)$$, 'mudança do período recalcula e invalida revisão');
select throws_ok($$delete from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, '42501', null, 'usuário autenticado não exclui cálculo');
select throws_ok($$select public.ensure_trip_overnight_calculation('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000003')$$, 'P0001', 'trip_overnight_period_required', 'viagem sem período não pode ser recalculada');
select ok(public.review_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 6), 'cálculo recalculado pode ser revisado');
select public.cancel_trip('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 'Cancelada para validar histórico');
select results_eq($$select reviewed_at is not null from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (true)$$, 'cancelamento preserva revisão');
select throws_ok($$select public.review_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 7)$$, 'P0001', 'trip_overnight_not_editable', 'viagem cancelada não altera pernoites');
select public.restore_canceled_trip('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002');
select results_eq($$select reviewed_at, adjusted_overnights from public.trip_overnights where trip_id = 'a9300000-0000-4000-8000-000000000002'$$, $$values (null::timestamptz, null::integer)$$, 'restauração exige nova revisão');

reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_overnights', 'values (2::bigint)', 'coordenador consulta cálculos do tenant');
select ok(public.review_trip_overnights('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000002', 8), 'coordenador revisa cálculo');

reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_overnights', 'values (0::bigint)', 'técnico não consulta pernoites administrativos');
select throws_ok($$select public.ensure_trip_overnight_calculation('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_overnight_not_editable', 'técnico não recalcula');

reset role;
select set_config('request.jwt.claim.sub', '91000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_overnights', 'values (0::bigint)', 'usuário bloqueado não consulta');

reset role;
select set_config('request.jwt.claim.sub', '92000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq('select count(*) from public.trip_overnights', 'values (0::bigint)', 'outro tenant não consulta cálculos');
select throws_ok($$select public.ensure_trip_overnight_calculation('a9000000-0000-4000-8000-000000000001', 'a9300000-0000-4000-8000-000000000001')$$, 'P0001', 'trip_overnight_not_editable', 'outro tenant não recalcula');

select * from finish();
rollback;
