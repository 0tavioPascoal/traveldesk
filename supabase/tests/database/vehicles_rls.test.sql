begin;

select plan(22);

select has_table('public', 'vehicles', 'vehicles deve existir');
select has_type('public', 'vehicle_operational_status', 'status operacional deve ser controlado');
select has_index('public', 'vehicles', 'vehicles_organization_plate_key', 'placa deve ser única por organização');
select has_trigger('public', 'vehicles', 'vehicles_set_updated_at', 'vehicles deve atualizar updated_at');
select has_trigger('public', 'vehicles', 'vehicles_prevent_mileage_reduction', 'vehicles deve proteger redução de quilometragem');
select policies_are(
  'public',
  'vehicles',
  array[
    'vehicles_insert_administrative',
    'vehicles_select_administrative',
    'vehicles_update_administrative'
  ],
  'vehicles deve possuir somente as policies administrativas esperadas'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('41000000-0000-4000-8000-000000000001', 'vehicle-admin-a@example.test', '{}'),
  ('41000000-0000-4000-8000-000000000002', 'vehicle-coordinator-a@example.test', '{}'),
  ('41000000-0000-4000-8000-000000000003', 'vehicle-technician-a@example.test', '{}'),
  ('41000000-0000-4000-8000-000000000004', 'vehicle-blocked-a@example.test', '{}'),
  ('42000000-0000-4000-8000-000000000001', 'vehicle-admin-b@example.test', '{}');

insert into public.organizations (id, name, slug)
values
  ('e0000000-0000-4000-8000-000000000001', 'Organização Veículos A', 'organizacao-veiculos-a'),
  ('f0000000-0000-4000-8000-000000000001', 'Organização Veículos B', 'organizacao-veiculos-b');

insert into public.organization_members (organization_id, profile_id, role, status)
values
  ('e0000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('e0000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('e0000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('e0000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000004', 'admin', 'blocked'),
  ('f0000000-0000-4000-8000-000000000001', '42000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.vehicles (
  id, organization_id, plate, brand, model, passenger_capacity,
  base_city, base_state, current_mileage, operational_status,
  created_by, updated_by
)
values
  (
    'e1000000-0000-4000-8000-000000000001',
    'e0000000-0000-4000-8000-000000000001',
    'ABC1234', 'Fiat', 'Cronos', 5, 'Ribeirão Preto', 'SP', 1000,
    'available',
    '41000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000001'
  ),
  (
    'f1000000-0000-4000-8000-000000000001',
    'f0000000-0000-4000-8000-000000000001',
    'ABC1234', 'Fiat', 'Cronos', 5, 'Franca', 'SP', 500,
    'maintenance',
    '42000000-0000-4000-8000-000000000001',
    '42000000-0000-4000-8000-000000000001'
  );

update public.organizations
set active = false
where id = 'f0000000-0000-4000-8000-000000000001';

select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select results_eq(
  'select count(*) from public.vehicles',
  'values (1::bigint)',
  'admin deve consultar somente veículos da própria organização'
);
select lives_ok(
  $$insert into public.vehicles (
    organization_id, plate, brand, model, passenger_capacity, base_city,
    base_state, operational_status, created_by, updated_by
  ) values (
    'e0000000-0000-4000-8000-000000000001', 'DEF1G23', 'Volkswagen',
    'T-Cross', 5, 'Ribeirão Preto', 'SP', 'blocked',
    '41000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000001'
  )$$,
  'admin deve cadastrar veículo'
);
select throws_ok(
  $$insert into public.vehicles (
    organization_id, plate, brand, model, passenger_capacity, base_city,
    base_state, created_by, updated_by
  ) values (
    'e0000000-0000-4000-8000-000000000001', 'ABC1234', 'Outra', 'Duplicado',
    5, 'Ribeirão Preto', 'SP',
    '41000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000001'
  )$$,
  '23505', null, 'placa duplicada na organização deve ser rejeitada'
);
select throws_ok(
  $$insert into public.vehicles (
    organization_id, plate, brand, model, passenger_capacity, base_city,
    base_state, created_by, updated_by
  ) values (
    'e0000000-0000-4000-8000-000000000001', 'PLACA', 'Marca', 'Modelo',
    5, 'Ribeirão Preto', 'SP',
    '41000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000001'
  )$$,
  '23514', null, 'placa inválida deve ser rejeitada'
);
select throws_ok(
  $$insert into public.vehicles (
    organization_id, plate, brand, model, passenger_capacity, base_city,
    base_state, created_by, updated_by
  ) values (
    'e0000000-0000-4000-8000-000000000001', 'GHI2J34', 'Marca', 'Modelo',
    0, 'Ribeirão Preto', 'SP',
    '41000000-0000-4000-8000-000000000001',
    '41000000-0000-4000-8000-000000000001'
  )$$,
  '23514', null, 'capacidade inválida deve ser rejeitada'
);
select results_eq(
  $$update public.vehicles
    set model = 'Inválido', updated_by = '41000000-0000-4000-8000-000000000001'
    where id = 'f1000000-0000-4000-8000-000000000001'
    returning id$$,
  $$select null::uuid where false$$,
  'admin não deve atualizar veículo de outra organização'
);
select lives_ok(
  $$update public.vehicles
    set current_mileage = 900,
        updated_by = '41000000-0000-4000-8000-000000000001'
    where id = 'e1000000-0000-4000-8000-000000000001'$$,
  'admin deve corrigir quilometragem para baixo'
);
select throws_ok(
  $$delete from public.vehicles
    where id = 'e1000000-0000-4000-8000-000000000001'$$,
  '42501', null, 'admin não deve excluir veículo fisicamente'
);

reset role;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000002', true);
set local role authenticated;

select results_eq(
  'select count(*) from public.vehicles',
  'values (2::bigint)',
  'coordenador deve consultar veículos da própria organização'
);
select lives_ok(
  $$insert into public.vehicles (
    organization_id, plate, brand, model, passenger_capacity, base_city,
    base_state, created_by, updated_by
  ) values (
    'e0000000-0000-4000-8000-000000000001', 'JKL3M45', 'Chevrolet', 'Spin',
    7, 'Sertãozinho', 'SP',
    '41000000-0000-4000-8000-000000000002',
    '41000000-0000-4000-8000-000000000002'
  )$$,
  'coordenador deve cadastrar veículo'
);
select lives_ok(
  $$update public.vehicles
    set current_mileage = 1100,
        updated_by = '41000000-0000-4000-8000-000000000002'
    where id = 'e1000000-0000-4000-8000-000000000001'$$,
  'coordenador deve aumentar quilometragem'
);
select throws_ok(
  $$update public.vehicles
    set current_mileage = 1000,
        updated_by = '41000000-0000-4000-8000-000000000002'
    where id = 'e1000000-0000-4000-8000-000000000001'$$,
  'P0001', 'vehicle_mileage_reduction_forbidden',
  'coordenador não deve reduzir quilometragem'
);

reset role;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000003', true);
set local role authenticated;

select results_eq(
  'select count(*) from public.vehicles',
  'values (0::bigint)',
  'técnico não deve consultar veículos administrativos'
);
select throws_ok(
  $$insert into public.vehicles (
    organization_id, plate, brand, model, passenger_capacity, base_city,
    base_state, created_by, updated_by
  ) values (
    'e0000000-0000-4000-8000-000000000001', 'MNO4P56', 'Marca', 'Modelo',
    5, 'Ribeirão Preto', 'SP',
    '41000000-0000-4000-8000-000000000003',
    '41000000-0000-4000-8000-000000000003'
  )$$,
  '42501', null, 'técnico não deve cadastrar veículo'
);

reset role;
select set_config('request.jwt.claim.sub', '41000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select results_eq(
  'select count(*) from public.vehicles',
  'values (0::bigint)',
  'usuário bloqueado não deve consultar veículos'
);

reset role;
select set_config('request.jwt.claim.sub', '42000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select results_eq(
  'select count(*) from public.vehicles',
  'values (0::bigint)',
  'organização inativa não deve consultar veículos'
);

select * from finish();
rollback;
