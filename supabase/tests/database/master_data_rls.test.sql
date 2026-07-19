begin;

select plan(48);

select has_table('public', 'skills', 'skills deve existir');
select has_table('public', 'service_types', 'service_types deve existir');
select has_index(
  'public',
  'skills',
  'skills_organization_name_lower_key',
  'skills deve possuir unicidade por organização e nome normalizado'
);
select has_index(
  'public',
  'service_types',
  'service_types_organization_name_lower_key',
  'service_types deve possuir unicidade por organização e nome normalizado'
);
select has_trigger(
  'public',
  'skills',
  'skills_set_updated_at',
  'skills deve atualizar updated_at automaticamente'
);
select has_trigger(
  'public',
  'service_types',
  'service_types_set_updated_at',
  'service_types deve atualizar updated_at automaticamente'
);
select policies_are(
  'public',
  'skills',
  array[
    'skills_insert_administrative',
    'skills_select_administrative',
    'skills_select_operational',
    'skills_update_administrative'
  ],
  'skills deve possuir somente as policies esperadas'
);
select policies_are(
  'public',
  'service_types',
  array[
    'service_types_insert_administrative',
    'service_types_select_administrative',
    'service_types_select_operational',
    'service_types_update_administrative'
  ],
  'service_types deve possuir somente as policies esperadas'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'admin-a@example.test', '{}'),
  ('10000000-0000-4000-8000-000000000002', 'coordinator-a@example.test', '{}'),
  ('10000000-0000-4000-8000-000000000003', 'technician-a@example.test', '{}'),
  ('10000000-0000-4000-8000-000000000004', 'outsider@example.test', '{}'),
  ('20000000-0000-4000-8000-000000000001', 'admin-b@example.test', '{}');

insert into public.organizations (id, name, slug)
values
  ('a0000000-0000-4000-8000-000000000001', 'Organização A', 'organizacao-a'),
  ('b0000000-0000-4000-8000-000000000001', 'Organização B', 'organizacao-b');

insert into public.organization_members (
  organization_id,
  profile_id,
  role,
  status
)
values
  (
    'a0000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'admin',
    'active'
  ),
  (
    'a0000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000002',
    'coordinator',
    'active'
  ),
  (
    'a0000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    'technician',
    'active'
  ),
  (
    'b0000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'admin',
    'active'
  );

insert into public.skills (
  id,
  organization_id,
  name,
  description,
  active,
  created_by,
  updated_by
)
values
  (
    'a1000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Automação',
    null,
    true,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Legada',
    null,
    false,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'b1000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'Automação',
    null,
    true,
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  );

insert into public.service_types (
  id,
  organization_id,
  name,
  description,
  active,
  created_by,
  updated_by
)
values
  (
    'a2000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'Implantação',
    null,
    true,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'a2000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    'Legado',
    null,
    false,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    'b2000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'Implantação',
    null,
    true,
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  );

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select results_eq(
  'select count(*) from public.skills',
  'values (2::bigint)',
  'admin deve consultar skills ativos e inativos da própria organização'
);
select results_eq(
  'select count(*) from public.service_types',
  'values (2::bigint)',
  'admin deve consultar service_types ativos e inativos da própria organização'
);
select lives_ok(
  $$insert into public.skills (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'RFID',
    true,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  'admin deve cadastrar skill'
);
select lives_ok(
  $$insert into public.service_types (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Treinamento',
    true,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  'admin deve cadastrar service_type'
);
select lives_ok(
  $$update public.skills
    set description = 'Descrição atualizada',
        updated_by = '10000000-0000-4000-8000-000000000001'
    where id = 'a1000000-0000-4000-8000-000000000001'$$,
  'admin deve atualizar skill'
);
select lives_ok(
  $$update public.service_types
    set description = 'Descrição atualizada',
        updated_by = '10000000-0000-4000-8000-000000000001'
    where id = 'a2000000-0000-4000-8000-000000000001'$$,
  'admin deve atualizar service_type'
);
select throws_ok(
  $$insert into public.skills (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Banco de dados',
    true,
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  '42501',
  null,
  'created_by de skill deve ser o usuário autenticado'
);
select throws_ok(
  $$insert into public.service_types (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Reunião',
    true,
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  '42501',
  null,
  'created_by de service_type deve ser o usuário autenticado'
);
select throws_ok(
  $$update public.skills
    set description = 'Auditoria inválida',
        updated_by = '10000000-0000-4000-8000-000000000002'
    where id = 'a1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'updated_by de skill deve ser o usuário autenticado'
);
select throws_ok(
  $$update public.service_types
    set description = 'Auditoria inválida',
        updated_by = '10000000-0000-4000-8000-000000000002'
    where id = 'a2000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'updated_by de service_type deve ser o usuário autenticado'
);
select results_eq(
  $$update public.skills
    set active = false,
        updated_by = '10000000-0000-4000-8000-000000000001'
    where id = 'b1000000-0000-4000-8000-000000000001'
    returning id$$,
  $$select null::uuid where false$$,
  'admin não deve atualizar skill de outra organização'
);
select results_eq(
  $$update public.service_types
    set active = false,
        updated_by = '10000000-0000-4000-8000-000000000001'
    where id = 'b2000000-0000-4000-8000-000000000001'
    returning id$$,
  $$select null::uuid where false$$,
  'admin não deve atualizar service_type de outra organização'
);
select throws_ok(
  $$update public.skills
    set organization_id = 'b0000000-0000-4000-8000-000000000001'
    where id = 'a1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'organization_id de skill não deve ser alterável'
);
select throws_ok(
  $$update public.service_types
    set organization_id = 'b0000000-0000-4000-8000-000000000001'
    where id = 'a2000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'organization_id de service_type não deve ser alterável'
);
select throws_ok(
  $$delete from public.skills
    where id = 'a1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'usuário autenticado não deve excluir skill'
);
select throws_ok(
  $$delete from public.service_types
    where id = 'a2000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'usuário autenticado não deve excluir service_type'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000002',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.skills where not active',
  'values (1::bigint)',
  'coordenador deve consultar skills inativos'
);
select results_eq(
  'select count(*) from public.service_types where not active',
  'values (1::bigint)',
  'coordenador deve consultar service_types inativos'
);
select lives_ok(
  $$insert into public.skills (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Integração SAP',
    true,
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002'
  )$$,
  'coordenador deve cadastrar skill'
);
select lives_ok(
  $$insert into public.service_types (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Go-live',
    true,
    '10000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002'
  )$$,
  'coordenador deve cadastrar service_type'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000003',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.skills where active',
  'values (3::bigint)',
  'técnico deve consultar skills ativos da própria organização'
);
select results_eq(
  'select count(*) from public.service_types where active',
  'values (3::bigint)',
  'técnico deve consultar service_types ativos da própria organização'
);
select results_eq(
  'select count(*) from public.skills where not active',
  'values (0::bigint)',
  'técnico não deve consultar skills inativos'
);
select results_eq(
  'select count(*) from public.service_types where not active',
  'values (0::bigint)',
  'técnico não deve consultar service_types inativos'
);
select throws_ok(
  $$insert into public.skills (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Suporte',
    true,
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003'
  )$$,
  '42501',
  null,
  'técnico não deve cadastrar skill'
);
select throws_ok(
  $$insert into public.service_types (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'Suporte presencial',
    true,
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000003'
  )$$,
  '42501',
  null,
  'técnico não deve cadastrar service_type'
);
select results_eq(
  $$update public.skills
    set active = false,
        updated_by = '10000000-0000-4000-8000-000000000003'
    where id = 'a1000000-0000-4000-8000-000000000001'
    returning id$$,
  $$select null::uuid where false$$,
  'técnico não deve atualizar skill'
);
select results_eq(
  $$update public.service_types
    set active = false,
        updated_by = '10000000-0000-4000-8000-000000000003'
    where id = 'a2000000-0000-4000-8000-000000000001'
    returning id$$,
  $$select null::uuid where false$$,
  'técnico não deve atualizar service_type'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000004',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.skills',
  'values (0::bigint)',
  'usuário externo não deve consultar skills'
);
select results_eq(
  'select count(*) from public.service_types',
  'values (0::bigint)',
  'usuário externo não deve consultar service_types'
);

reset role;

update public.skills
set active = false
where organization_id = 'a0000000-0000-4000-8000-000000000001'
  and name = 'RFID';

update public.service_types
set active = false
where organization_id = 'a0000000-0000-4000-8000-000000000001'
  and name = 'Treinamento';

select throws_ok(
  $$insert into public.skills (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'rfid',
    true,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  '23505',
  null,
  'skill inativa deve reservar o nome sem diferenciar caixa'
);
select throws_ok(
  $$insert into public.service_types (
    organization_id, name, active, created_by, updated_by
  ) values (
    'a0000000-0000-4000-8000-000000000001',
    'treinamento',
    true,
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  )$$,
  '23505',
  null,
  'service_type inativo deve reservar o nome sem diferenciar caixa'
);
select lives_ok(
  $$insert into public.skills (
    organization_id, name, active, created_by, updated_by
  ) values (
    'b0000000-0000-4000-8000-000000000001',
    'RFID',
    true,
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  )$$,
  'organizações diferentes podem repetir nome de skill'
);
select lives_ok(
  $$insert into public.service_types (
    organization_id, name, active, created_by, updated_by
  ) values (
    'b0000000-0000-4000-8000-000000000001',
    'Treinamento',
    true,
    '20000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001'
  )$$,
  'organizações diferentes podem repetir nome de service_type'
);

update public.skills
set created_at = now() - interval '1 minute'
where id = 'a1000000-0000-4000-8000-000000000001';

update public.service_types
set created_at = now() - interval '1 minute'
where id = 'a2000000-0000-4000-8000-000000000001';

select results_eq(
  $$update public.skills
    set name = 'Automação industrial'
    where id = 'a1000000-0000-4000-8000-000000000001'
    returning updated_at > created_at$$,
  'values (true)',
  'updated_at de skill deve avançar automaticamente'
);
select results_eq(
  $$update public.service_types
    set name = 'Implantação assistida'
    where id = 'a2000000-0000-4000-8000-000000000001'
    returning updated_at > created_at$$,
  'values (true)',
  'updated_at de service_type deve avançar automaticamente'
);

update public.organization_members
set status = 'blocked'
where profile_id = '10000000-0000-4000-8000-000000000001';

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.skills',
  'values (0::bigint)',
  'membro bloqueado não deve consultar skills'
);
select results_eq(
  'select count(*) from public.service_types',
  'values (0::bigint)',
  'membro bloqueado não deve consultar service_types'
);

reset role;
update public.organization_members
set status = 'active'
where profile_id = '10000000-0000-4000-8000-000000000001';
update public.organizations
set active = false
where id = 'a0000000-0000-4000-8000-000000000001';
set local role authenticated;

select results_eq(
  'select count(*) from public.skills',
  'values (0::bigint)',
  'organização inativa não deve expor skills'
);
select results_eq(
  'select count(*) from public.service_types',
  'values (0::bigint)',
  'organização inativa não deve expor service_types'
);

reset role;

select * from finish();
rollback;
