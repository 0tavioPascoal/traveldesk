begin;

select plan(47);

select has_table('public', 'clients', 'clients deve existir');
select has_table('public', 'client_units', 'client_units deve existir');
select has_index(
  'public',
  'clients',
  'clients_organization_legal_name_lower_key',
  'razão social deve ser única por organização sem diferenciar caixa'
);
select has_index(
  'public',
  'clients',
  'clients_organization_tax_id_key',
  'CNPJ de cliente deve possuir índice único parcial'
);
select has_index(
  'public',
  'client_units',
  'client_units_client_name_lower_key',
  'nome da unidade deve ser único por cliente sem diferenciar caixa'
);
select has_index(
  'public',
  'client_units',
  'client_units_organization_tax_id_key',
  'CNPJ de unidade deve possuir índice único parcial'
);
select has_trigger(
  'public',
  'clients',
  'clients_set_updated_at',
  'clients deve atualizar updated_at automaticamente'
);
select has_trigger(
  'public',
  'client_units',
  'client_units_set_updated_at',
  'client_units deve atualizar updated_at automaticamente'
);
select policies_are(
  'public',
  'clients',
  array[
    'clients_insert_administrative',
    'clients_select_administrative',
    'clients_update_administrative'
  ],
  'clients deve possuir somente as policies administrativas esperadas'
);
select policies_are(
  'public',
  'client_units',
  array[
    'client_units_insert_administrative',
    'client_units_select_administrative',
    'client_units_update_administrative'
  ],
  'client_units deve possuir somente as policies administrativas esperadas'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('31000000-0000-4000-8000-000000000001', 'admin-client-a@example.test', '{}'),
  ('31000000-0000-4000-8000-000000000002', 'coordinator-client-a@example.test', '{}'),
  ('31000000-0000-4000-8000-000000000003', 'technician-client-a@example.test', '{}'),
  ('31000000-0000-4000-8000-000000000004', 'outsider-client@example.test', '{}'),
  ('32000000-0000-4000-8000-000000000001', 'admin-client-b@example.test', '{}');

insert into public.organizations (id, name, slug)
values
  ('ca000000-0000-4000-8000-000000000001', 'Organização Clientes A', 'clientes-a'),
  ('cb000000-0000-4000-8000-000000000001', 'Organização Clientes B', 'clientes-b');

insert into public.organization_members (
  organization_id,
  profile_id,
  role,
  status
)
values
  (
    'ca000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001',
    'admin',
    'active'
  ),
  (
    'ca000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000002',
    'coordinator',
    'active'
  ),
  (
    'ca000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000003',
    'technician',
    'active'
  ),
  (
    'cb000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001',
    'admin',
    'active'
  );

insert into public.clients (
  id,
  organization_id,
  legal_name,
  trade_name,
  tax_id,
  active,
  created_by,
  updated_by
)
values
  (
    'c1000000-0000-4000-8000-000000000001',
    'ca000000-0000-4000-8000-000000000001',
    'Usina Alfa',
    'Alfa',
    '11111111111111',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'ca000000-0000-4000-8000-000000000001',
    'Cliente Inativo',
    null,
    null,
    false,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  ),
  (
    'c2000000-0000-4000-8000-000000000001',
    'cb000000-0000-4000-8000-000000000001',
    'Cliente Beta',
    null,
    '22222222222222',
    true,
    '32000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001'
  );

insert into public.client_units (
  id,
  organization_id,
  client_id,
  name,
  tax_id,
  city,
  state,
  active,
  created_by,
  updated_by
)
values
  (
    'd1000000-0000-4000-8000-000000000001',
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Matriz',
    '44444444444444',
    'Ribeirão Preto',
    'SP',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  ),
  (
    'd1000000-0000-4000-8000-000000000002',
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Unidade Legada',
    null,
    'Sertãozinho',
    'SP',
    false,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  );

select set_config(
  'request.jwt.claim.sub',
  '31000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select results_eq(
  'select count(*) from public.clients',
  'values (2::bigint)',
  'admin deve consultar clientes ativos e inativos da própria organização'
);
select results_eq(
  'select count(*) from public.client_units',
  'values (2::bigint)',
  'admin deve consultar unidades ativas e inativas da própria organização'
);
select lives_ok(
  $$insert into public.clients (
    organization_id, legal_name, tax_id, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'Cliente Novo',
    '33333333333333',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  'admin deve cadastrar cliente'
);
select lives_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, city, state, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Unidade Nova',
    'Araraquara',
    'SP',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  'admin deve cadastrar unidade em cliente ativo'
);
select throws_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, city, state, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000002',
    'Unidade Inválida',
    'Campinas',
    'SP',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '42501',
  null,
  'cliente inativo não deve receber unidade'
);
select throws_ok(
  $$update public.clients
    set active = false,
        updated_by = '31000000-0000-4000-8000-000000000001'
    where id = 'c1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'cliente com unidade ativa não deve ser inativado'
);
select lives_ok(
  $$update public.client_units
    set active = false,
        updated_by = '31000000-0000-4000-8000-000000000001'
    where client_id = 'c1000000-0000-4000-8000-000000000001'$$,
  'admin deve inativar as unidades do cliente'
);
select lives_ok(
  $$update public.clients
    set active = false,
        updated_by = '31000000-0000-4000-8000-000000000001'
    where id = 'c1000000-0000-4000-8000-000000000001'$$,
  'cliente sem unidade ativa pode ser inativado'
);
select throws_ok(
  $$insert into public.clients (
    organization_id, legal_name, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'Auditoria Cliente',
    true,
    '31000000-0000-4000-8000-000000000002',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '42501',
  null,
  'created_by do cliente deve ser o usuário autenticado'
);
select throws_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, city, state, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Auditoria Unidade',
    'Campinas',
    'SP',
    true,
    '31000000-0000-4000-8000-000000000002',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '42501',
  null,
  'created_by da unidade deve ser o usuário autenticado'
);
select throws_ok(
  $$update public.clients
    set organization_id = 'cb000000-0000-4000-8000-000000000001'
    where id = 'c1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'organization_id do cliente deve ser imutável'
);
select throws_ok(
  $$update public.client_units
    set client_id = 'c1000000-0000-4000-8000-000000000002'
    where id = 'd1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'client_id da unidade deve ser imutável'
);
select throws_ok(
  $$delete from public.clients
    where id = 'c1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'usuário autenticado não deve excluir cliente'
);
select throws_ok(
  $$delete from public.client_units
    where id = 'd1000000-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'usuário autenticado não deve excluir unidade'
);
select results_eq(
  $$select count(*) from public.clients
    where organization_id = 'cb000000-0000-4000-8000-000000000001'$$,
  'values (0::bigint)',
  'admin não deve consultar clientes de outra organização'
);
select results_eq(
  $$select count(*) from public.client_units
    where organization_id = 'cb000000-0000-4000-8000-000000000001'$$,
  'values (0::bigint)',
  'admin não deve consultar unidades de outra organização'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '31000000-0000-4000-8000-000000000002',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.clients',
  'values (3::bigint)',
  'coordenador deve consultar todos os clientes da organização'
);
select results_eq(
  'select count(*) from public.client_units',
  'values (3::bigint)',
  'coordenador deve consultar todas as unidades da organização'
);
select lives_ok(
  $$insert into public.clients (
    organization_id, legal_name, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'Cliente Coordenador',
    true,
    '31000000-0000-4000-8000-000000000002',
    '31000000-0000-4000-8000-000000000002'
  )$$,
  'coordenador deve cadastrar cliente'
);
select lives_ok(
  $$update public.client_units
    set notes = 'Correção em unidade inativa',
        updated_by = '31000000-0000-4000-8000-000000000002'
    where id = 'd1000000-0000-4000-8000-000000000001'$$,
  'coordenador deve editar unidade inativa de cliente inativo'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '31000000-0000-4000-8000-000000000003',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.clients',
  'values (0::bigint)',
  'técnico não deve consultar clientes'
);
select results_eq(
  'select count(*) from public.client_units',
  'values (0::bigint)',
  'técnico não deve consultar unidades'
);
select throws_ok(
  $$insert into public.clients (
    organization_id, legal_name, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'Cliente Técnico',
    true,
    '31000000-0000-4000-8000-000000000003',
    '31000000-0000-4000-8000-000000000003'
  )$$,
  '42501',
  null,
  'técnico não deve cadastrar cliente'
);
select throws_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, city, state, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Unidade Técnico',
    'Campinas',
    'SP',
    true,
    '31000000-0000-4000-8000-000000000003',
    '31000000-0000-4000-8000-000000000003'
  )$$,
  '42501',
  null,
  'técnico não deve cadastrar unidade'
);

reset role;

select throws_ok(
  $$insert into public.clients (
    organization_id, legal_name, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'usina alfa',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '23505',
  null,
  'razão social deve ser única sem diferenciar caixa'
);
select throws_ok(
  $$insert into public.clients (
    organization_id, legal_name, tax_id, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'Cliente Documento Duplicado',
    '11111111111111',
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '23505',
  null,
  'CNPJ de cliente deve ser único por organização'
);
select throws_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, city, state, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'matriz',
    'Ribeirão Preto',
    'SP',
    false,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '23505',
  null,
  'nome de unidade deve ser único no cliente sem diferenciar caixa'
);
select throws_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, tax_id, city, state, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Unidade Documento Duplicado',
    '44444444444444',
    'Ribeirão Preto',
    'SP',
    false,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  '23505',
  null,
  'CNPJ de unidade deve ser único por organização'
);
select lives_ok(
  $$insert into public.clients (
    organization_id, legal_name, tax_id, active, created_by, updated_by
  ) values (
    'cb000000-0000-4000-8000-000000000001',
    'Cliente Documento Compartilhado',
    '11111111111111',
    true,
    '32000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001'
  )$$,
  'organizações diferentes podem repetir CNPJ de cliente'
);
select lives_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, tax_id, city, state, active, created_by, updated_by
  ) values (
    'cb000000-0000-4000-8000-000000000001',
    'c2000000-0000-4000-8000-000000000001',
    'Unidade Documento Compartilhado',
    '44444444444444',
    'Campinas',
    'SP',
    true,
    '32000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001'
  )$$,
  'organizações diferentes podem repetir CNPJ de unidade'
);
select throws_ok(
  $$insert into public.client_units (
    organization_id, client_id, name, city, state, active, created_by, updated_by
  ) values (
    'cb000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000001',
    'Unidade Cruzada',
    'Campinas',
    'SP',
    true,
    '32000000-0000-4000-8000-000000000001',
    '32000000-0000-4000-8000-000000000001'
  )$$,
  '23503',
  null,
  'FK composta deve impedir cliente de outra organização'
);
select lives_ok(
  $$insert into public.clients (
    organization_id, legal_name, tax_id, active, created_by, updated_by
  ) values (
    'ca000000-0000-4000-8000-000000000001',
    'Cliente Sem Documento',
    null,
    true,
    '31000000-0000-4000-8000-000000000001',
    '31000000-0000-4000-8000-000000000001'
  )$$,
  'vários clientes podem permanecer sem CNPJ'
);

update public.clients
set created_at = now() - interval '1 minute'
where id = 'c1000000-0000-4000-8000-000000000001';

select results_eq(
  $$update public.clients
    set legal_name = 'Usina Alfa Atualizada'
    where id = 'c1000000-0000-4000-8000-000000000001'
    returning updated_at > created_at$$,
  'values (true)',
  'updated_at deve avançar automaticamente'
);

update public.organization_members
set status = 'blocked'
where profile_id = '31000000-0000-4000-8000-000000000001';

select set_config(
  'request.jwt.claim.sub',
  '31000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.clients',
  'values (0::bigint)',
  'membro bloqueado não deve consultar clientes'
);
select results_eq(
  'select count(*) from public.client_units',
  'values (0::bigint)',
  'membro bloqueado não deve consultar unidades'
);

reset role;
update public.organization_members
set status = 'active'
where profile_id = '31000000-0000-4000-8000-000000000001';
update public.organizations
set active = false
where id = 'ca000000-0000-4000-8000-000000000001';
set local role authenticated;

select results_eq(
  'select count(*) from public.clients',
  'values (0::bigint)',
  'organização inativa não deve expor clientes'
);
select results_eq(
  'select count(*) from public.client_units',
  'values (0::bigint)',
  'organização inativa não deve expor unidades'
);

reset role;

select * from finish();
rollback;
