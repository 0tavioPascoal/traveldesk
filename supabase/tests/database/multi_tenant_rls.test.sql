begin;

select plan(21);

select has_table('public', 'organizations', 'organizations deve existir');
select has_table('public', 'profiles', 'profiles deve existir');
select has_table(
  'public',
  'organization_members',
  'organization_members deve existir'
);
select has_type('public', 'organization_role', 'organization_role deve existir');
select has_type(
  'public',
  'organization_member_status',
  'organization_member_status deve existir'
);
select has_index(
  'public',
  'organizations',
  'organizations_slug_key',
  'slug deve possuir índice único'
);
select has_index(
  'public',
  'organization_members',
  'organization_members_organization_profile_key',
  'vínculo deve ser único por organização e profile'
);
select policies_are(
  'public',
  'organizations',
  array['organizations_select_active_members'],
  'organizations deve possuir somente a policy esperada'
);
select policies_are(
  'public',
  'profiles',
  array['profiles_select_own'],
  'profiles deve possuir somente a policy esperada'
);
select policies_are(
  'public',
  'organization_members',
  array['organization_members_select_own'],
  'organization_members deve possuir somente a policy esperada'
);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-4000-8000-000000000001', 'tenant-a@example.test', '{}'),
  ('20000000-0000-4000-8000-000000000002', 'tenant-b@example.test', '{}');

insert into public.organizations (id, name, slug)
values
  ('a0000000-0000-4000-8000-000000000001', 'Organização A', 'organizacao-a'),
  ('b0000000-0000-4000-8000-000000000002', 'Organização B', 'organizacao-b');

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
    'b0000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'technician',
    'active'
  );

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select results_eq(
  'select email from public.profiles order by email',
  $$values ('tenant-a@example.test'::text)$$,
  'usuário deve consultar somente o próprio profile'
);
select results_eq(
  'select count(*) from public.organization_members',
  'values (1::bigint)',
  'usuário deve consultar somente o próprio vínculo'
);
select results_eq(
  'select slug from public.organizations order by slug',
  $$values ('organizacao-a'::text)$$,
  'usuário deve consultar somente a própria organização'
);
select results_eq(
  $$select private.is_active_organization_member(
    'a0000000-0000-4000-8000-000000000001'
  )$$,
  'values (true)',
  'helper deve confirmar vínculo ativo na organização A'
);
select results_eq(
  $$select private.is_active_organization_member(
    'b0000000-0000-4000-8000-000000000002'
  )$$,
  'values (false)',
  'helper deve negar organização de terceiro'
);
select results_eq(
  $$select private.has_organization_role(
    'a0000000-0000-4000-8000-000000000001',
    array['admin']::public.organization_role[]
  )$$,
  'values (true)',
  'admin deve passar quando explicitamente permitido'
);
select results_eq(
  $$select private.has_organization_role(
    'a0000000-0000-4000-8000-000000000001',
    array['coordinator']::public.organization_role[]
  )$$,
  'values (false)',
  'papéis não devem possuir hierarquia implícita'
);

reset role;
update public.organization_members
set status = 'blocked'
where profile_id = '10000000-0000-4000-8000-000000000001';
set local role authenticated;

select results_eq(
  'select count(*) from public.organizations',
  'values (0::bigint)',
  'membro bloqueado não deve consultar a organização'
);
select results_eq(
  'select count(*) from public.organization_members',
  'values (1::bigint)',
  'membro bloqueado ainda deve consultar o próprio vínculo'
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
  'select count(*) from public.organizations',
  'values (0::bigint)',
  'organização inativa não deve ser consultável'
);

reset role;
update public.organizations
set active = true
where id = 'a0000000-0000-4000-8000-000000000001';
update public.profiles
set active = false
where id = '10000000-0000-4000-8000-000000000001';
set local role authenticated;

select results_eq(
  'select count(*) from public.organizations',
  'values (0::bigint)',
  'profile inativo não deve acessar organizações'
);

reset role;

select * from finish();
rollback;
