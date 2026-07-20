begin;

select plan(35);

select has_table('public', 'technician_unavailability_types', 'tipos de técnico devem existir');
select has_table('public', 'vehicle_unavailability_types', 'tipos de veículo devem existir');
select has_table('public', 'technician_unavailabilities', 'indisponibilidades de técnico devem existir');
select has_table('public', 'vehicle_unavailabilities', 'indisponibilidades de veículo devem existir');
select policies_are('public', 'technician_unavailability_types', array[
  'technician_unavailability_types_insert_administrative',
  'technician_unavailability_types_select_administrative',
  'technician_unavailability_types_update_administrative'
], 'tipos de técnico devem ter somente policies administrativas');
select policies_are('public', 'vehicle_unavailability_types', array[
  'vehicle_unavailability_types_insert_administrative',
  'vehicle_unavailability_types_select_administrative',
  'vehicle_unavailability_types_update_administrative'
], 'tipos de veículo devem ter somente policies administrativas');
select policies_are('public', 'technician_unavailabilities', array[
  'technician_unavailabilities_insert_administrative',
  'technician_unavailabilities_select_administrative',
  'technician_unavailabilities_select_own',
  'technician_unavailabilities_update_administrative'
], 'indisponibilidades de técnico devem ter policies esperadas');
select policies_are('public', 'vehicle_unavailabilities', array[
  'vehicle_unavailabilities_insert_administrative',
  'vehicle_unavailabilities_select_administrative',
  'vehicle_unavailabilities_update_administrative'
], 'indisponibilidades de veículo devem ter policies administrativas');
select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'technician_unavailabilities_no_active_overlap'
      and conrelid = 'public.technician_unavailabilities'::regclass
  ),
  'técnicos devem bloquear sobreposição'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'vehicle_unavailabilities_no_active_overlap'
      and conrelid = 'public.vehicle_unavailabilities'::regclass
  ),
  'veículos devem bloquear sobreposição'
);

insert into auth.users (id, email, raw_user_meta_data) values
  ('51000000-0000-4000-8000-000000000001', 'unavailability-admin-a@example.test', '{}'),
  ('51000000-0000-4000-8000-000000000002', 'unavailability-coord-a@example.test', '{}'),
  ('51000000-0000-4000-8000-000000000003', 'unavailability-tech-a@example.test', '{}'),
  ('51000000-0000-4000-8000-000000000004', 'unavailability-blocked-a@example.test', '{}'),
  ('52000000-0000-4000-8000-000000000001', 'unavailability-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug, timezone) values
  ('a5000000-0000-4000-8000-000000000001', 'Indisponibilidades A', 'indisponibilidades-a', 'America/Sao_Paulo'),
  ('b5000000-0000-4000-8000-000000000001', 'Indisponibilidades B', 'indisponibilidades-b', 'America/Sao_Paulo');

insert into public.organization_members (organization_id, profile_id, role, status) values
  ('a5000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('a5000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('a5000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('a5000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000004', 'admin', 'blocked'),
  ('b5000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.technicians (
  id, organization_id, profile_id, name, base_city, base_state, created_by, updated_by
) values
  ('a5100000-0000-4000-8000-000000000001', 'a5000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000003', 'Técnico A', 'Ribeirão Preto', 'SP', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('a5100000-0000-4000-8000-000000000002', 'a5000000-0000-4000-8000-000000000001', null, 'Técnico B', 'Franca', 'SP', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('b5100000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', null, 'Técnico Outro', 'Franca', 'SP', '52000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001');

insert into public.vehicles (
  id, organization_id, plate, brand, model, passenger_capacity, base_city,
  base_state, created_by, updated_by
) values
  ('a5200000-0000-4000-8000-000000000001', 'a5000000-0000-4000-8000-000000000001', 'UNA1A11', 'Fiat', 'Cronos', 5, 'Ribeirão Preto', 'SP', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('b5200000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'UNB1B11', 'Fiat', 'Cronos', 5, 'Franca', 'SP', '52000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001');

insert into public.technician_unavailability_types (
  id, organization_id, name, created_by, updated_by
) values
  ('a5300000-0000-4000-8000-000000000001', 'a5000000-0000-4000-8000-000000000001', 'Férias', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('b5300000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'Férias', '52000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001');
insert into public.vehicle_unavailability_types (
  id, organization_id, name, created_by, updated_by
) values
  ('a5400000-0000-4000-8000-000000000001', 'a5000000-0000-4000-8000-000000000001', 'Manutenção', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('b5400000-0000-4000-8000-000000000001', 'b5000000-0000-4000-8000-000000000001', 'Manutenção', '52000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001');

insert into public.technician_unavailabilities (
  id, organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  reason, created_by, updated_by
) values
  ('a5500000-0000-4000-8000-000000000001', 'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5300000-0000-4000-8000-000000000001', '2020-01-01 11:00+00', '2020-01-01 15:00+00', 'Histórico', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('a5500000-0000-4000-8000-000000000002', 'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5300000-0000-4000-8000-000000000001', '2030-08-01 11:00+00', '2030-08-01 15:00+00', 'Futuro', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('a5500000-0000-4000-8000-000000000003', 'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000002', 'a5300000-0000-4000-8000-000000000001', '2030-08-01 11:00+00', '2030-08-01 15:00+00', 'Outro técnico', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001');
insert into public.vehicle_unavailabilities (
  id, organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5600000-0000-4000-8000-000000000001', 'a5000000-0000-4000-8000-000000000001', 'a5200000-0000-4000-8000-000000000001', 'a5400000-0000-4000-8000-000000000001', '2030-08-01 11:00+00', '2030-08-01 15:00+00', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
);

select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select results_eq('select count(*) from public.technician_unavailability_types', 'values (1::bigint)', 'admin consulta tipos técnicos do tenant');
select results_eq('select count(*) from public.vehicle_unavailability_types', 'values (1::bigint)', 'admin consulta tipos de veículo do tenant');
select results_eq('select count(*) from public.technician_unavailabilities', 'values (3::bigint)', 'admin consulta indisponibilidades técnicas do tenant');
select results_eq('select count(*) from public.vehicle_unavailabilities', 'values (1::bigint)', 'admin consulta indisponibilidades de veículo do tenant');
select lives_ok($$insert into public.technician_unavailabilities (
  organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5300000-0000-4000-8000-000000000001', '2030-08-01 15:00+00', '2030-08-01 18:00+00', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
)$$, 'período encostado deve ser permitido');
select throws_ok($$insert into public.technician_unavailabilities (
  organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5300000-0000-4000-8000-000000000001', '2030-08-01 14:00+00', '2030-08-01 16:00+00', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
)$$, '23P01', null, 'sobreposição ativa deve ser rejeitada');
select throws_ok($$insert into public.vehicle_unavailabilities (
  organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5200000-0000-4000-8000-000000000001', 'a5400000-0000-4000-8000-000000000001', '2030-09-01 12:00+00', '2030-09-01 12:00+00', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
)$$, '23514', null, 'período vazio deve ser rejeitado');
select throws_ok($$insert into public.technician_unavailabilities (
  organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5400000-0000-4000-8000-000000000001', '2030-09-01 12:00+00', '2030-09-01 13:00+00', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
)$$, 'P0001', 'unavailability_type_not_available', 'tipo de veículo não pode ser usado para técnico');
select results_eq($$update public.technician_unavailabilities set reason = 'Inválido', updated_by = '51000000-0000-4000-8000-000000000001' where organization_id = 'b5000000-0000-4000-8000-000000000001' returning id$$, $$select null::uuid where false$$, 'admin não altera outro tenant');
select throws_ok($$insert into public.technician_unavailability_types (organization_id, name, created_by, updated_by) values ('a5000000-0000-4000-8000-000000000001', 'FÉRIAS', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001')$$, '23505', null, 'nome de tipo duplicado ignora caixa');
select throws_ok($$delete from public.technician_unavailabilities where id = 'a5500000-0000-4000-8000-000000000001'$$, '42501', null, 'exclusão física deve ser proibida');
select throws_ok($$insert into public.vehicle_unavailabilities (
  organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at, all_day,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5200000-0000-4000-8000-000000000001', 'a5400000-0000-4000-8000-000000000001', '2030-09-01 12:00+00', '2030-09-02 03:00+00', true, '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
)$$, 'P0001', 'invalid_all_day_period', 'dia inteiro deve respeitar meia-noite local');
select lives_ok($$update public.technician_unavailabilities set active = false, updated_by = '51000000-0000-4000-8000-000000000001' where id = 'a5500000-0000-4000-8000-000000000002'$$, 'inativação deve liberar período');
select lives_ok($$insert into public.technician_unavailabilities (
  organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5300000-0000-4000-8000-000000000001', '2030-08-01 11:00+00', '2030-08-01 15:00+00', '51000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'
)$$, 'intervalo inativado deve poder ser reutilizado');
select throws_ok($$update public.technician_unavailabilities set active = true, updated_by = '51000000-0000-4000-8000-000000000001' where id = 'a5500000-0000-4000-8000-000000000002'$$, '23P01', null, 'reativação conflitante deve falhar');

reset role;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select results_eq('select count(*) from public.technician_unavailabilities', 'values (5::bigint)', 'coordenador consulta indisponibilidades do tenant');
select throws_ok($$update public.technician_unavailabilities set reason = 'Correção indevida', updated_by = '51000000-0000-4000-8000-000000000002' where id = 'a5500000-0000-4000-8000-000000000001'$$, 'P0001', 'past_unavailability_edit_forbidden', 'coordenador não corrige período encerrado');
select lives_ok($$update public.technician_unavailabilities set active = false, updated_by = '51000000-0000-4000-8000-000000000002' where id = 'a5500000-0000-4000-8000-000000000001'$$, 'coordenador pode inativar período encerrado');
select lives_ok($$insert into public.vehicle_unavailabilities (
  organization_id, vehicle_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5200000-0000-4000-8000-000000000001', 'a5400000-0000-4000-8000-000000000001', '2030-09-01 12:00+00', '2030-09-01 14:00+00', '51000000-0000-4000-8000-000000000002', '51000000-0000-4000-8000-000000000002'
)$$, 'coordenador cadastra indisponibilidade de veículo');

reset role;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq('select count(*) from public.technician_unavailabilities', 'values (4::bigint)', 'técnico consulta somente as próprias indisponibilidades');
select results_eq('select count(*) from public.vehicle_unavailabilities', 'values (0::bigint)', 'técnico não consulta indisponibilidades de veículos');
select throws_ok($$insert into public.technician_unavailabilities (
  organization_id, technician_id, unavailability_type_id, starts_at, ends_at,
  created_by, updated_by
) values (
  'a5000000-0000-4000-8000-000000000001', 'a5100000-0000-4000-8000-000000000001', 'a5300000-0000-4000-8000-000000000001', '2031-01-01 12:00+00', '2031-01-01 13:00+00', '51000000-0000-4000-8000-000000000003', '51000000-0000-4000-8000-000000000003'
)$$, '42501', null, 'técnico não cadastra indisponibilidade');

reset role;
select set_config('request.jwt.claim.sub', '51000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select results_eq('select count(*) from public.technician_unavailabilities', 'values (0::bigint)', 'usuário bloqueado não consulta indisponibilidades');

reset role;
update public.organizations set active = false where id = 'b5000000-0000-4000-8000-000000000001';
select set_config('request.jwt.claim.sub', '52000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq('select count(*) from public.technician_unavailability_types', 'values (0::bigint)', 'organização inativa não consulta tipos');
select results_eq('select count(*) from public.vehicle_unavailabilities', 'values (0::bigint)', 'organização inativa não consulta períodos');

select * from finish();
rollback;
