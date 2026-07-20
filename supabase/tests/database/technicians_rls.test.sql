begin;

select plan(21);

select has_table('public', 'technicians', 'technicians deve existir');
select has_table('public', 'technician_skills', 'technician_skills deve existir');
select has_index('public', 'technicians', 'technicians_organization_document_key', 'documento deve ser único por organização');
select has_index('public', 'technicians', 'technicians_organization_profile_key', 'profile deve ser único por organização');
select has_index('public', 'technician_skills', 'technician_skills_one_primary_key', 'deve existir somente uma especialidade principal');
select has_trigger('public', 'technicians', 'technicians_set_updated_at', 'technicians deve atualizar updated_at');
select has_trigger('public', 'technician_skills', 'technician_skills_set_updated_at', 'technician_skills deve atualizar updated_at');
select policies_are('public', 'technicians', array['technicians_insert_administrative', 'technicians_select_administrative', 'technicians_select_own', 'technicians_update_administrative'], 'technicians deve possuir as policies esperadas');
select policies_are('public', 'technician_skills', array['technician_skills_delete_administrative', 'technician_skills_insert_administrative', 'technician_skills_select_administrative', 'technician_skills_select_own', 'technician_skills_update_administrative'], 'technician_skills deve possuir as policies esperadas');

insert into auth.users (id, email, raw_user_meta_data) values
  ('31000000-0000-4000-8000-000000000001', 'admin-tech@example.test', '{}'),
  ('31000000-0000-4000-8000-000000000002', 'coord-tech@example.test', '{}'),
  ('31000000-0000-4000-8000-000000000003', 'tech@example.test', '{}'),
  ('32000000-0000-4000-8000-000000000001', 'admin-other@example.test', '{}');

insert into public.organizations (id, name, slug) values
  ('c0000000-0000-4000-8000-000000000001', 'Organização Técnicos', 'organizacao-tecnicos'),
  ('d0000000-0000-4000-8000-000000000001', 'Outra Organização Técnicos', 'outra-organizacao-tecnicos');

insert into public.organization_members (organization_id, profile_id, role, status) values
  ('c0000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001', 'admin', 'active'),
  ('c0000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000002', 'coordinator', 'active'),
  ('c0000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000003', 'technician', 'active'),
  ('d0000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001', 'admin', 'active');

insert into public.skills (id, organization_id, name, active, created_by, updated_by) values
  ('c1000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Automação', true, '31000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001'),
  ('c1000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Legada', false, '31000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001'),
  ('d1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Automação', true, '32000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
set local role authenticated;

select lives_ok(
  $$select public.create_technician_with_skills(
    'c0000000-0000-4000-8000-000000000001', 'Ana Técnica', '52998224725',
    'ana@example.test', '16999999999', 'Técnica', 'Ribeirão Preto', 'SP',
    null, null, null, false, null,
    '[{"skill_id":"c1000000-0000-4000-8000-000000000001","proficiency_level":4,"is_primary":true}]'::jsonb
  )$$,
  'admin deve criar técnico e especialidades atomicamente'
);
select results_eq('select count(*) from public.technicians', 'values (1::bigint)', 'admin consulta técnicos da própria organização');
select results_eq('select count(*) from public.technician_skills', 'values (1::bigint)', 'associação deve ser criada');
select throws_ok(
  $$select public.create_technician_with_skills(
    'c0000000-0000-4000-8000-000000000001', 'Técnico inválido', null,
    null, null, null, 'Ribeirão Preto', 'SP', null, null, null, false, null,
    '[{"skill_id":"c1000000-0000-4000-8000-000000000002","proficiency_level":3,"is_primary":false}]'::jsonb
  )$$,
  'P0001', 'skill_not_available', 'especialidade inativa não pode ser adicionada'
);
select results_eq('select count(*) from public.technicians', 'values (1::bigint)', 'falha nas especialidades deve reverter o técnico');
select throws_ok(
  $$select public.create_technician_with_skills(
    'c0000000-0000-4000-8000-000000000001', 'Outra Ana', '52998224725',
    null, null, null, 'Franca', 'SP', null, null, null, false, null, '[]'::jsonb
  )$$,
  '23505', null, 'documento duplicado deve ser rejeitado'
);
select results_eq(
  $$select count(*) from public.technicians where organization_id = 'd0000000-0000-4000-8000-000000000001'$$,
  'values (0::bigint)', 'admin não consulta outra organização'
);
select lives_ok(
  $$select public.link_technician_profile(
    'c0000000-0000-4000-8000-000000000001',
    (select id from public.technicians where document = '52998224725'),
    '31000000-0000-4000-8000-000000000003'
  )$$,
  'admin deve vincular profile elegível'
);

reset role;
select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq('select count(*) from public.technicians', 'values (1::bigint)', 'técnico consulta somente o próprio cadastro');
select results_eq('select count(*) from public.technician_skills', 'values (1::bigint)', 'técnico consulta as próprias especialidades');
select throws_ok(
  $$insert into public.technicians (
    organization_id, name, base_city, base_state, created_by, updated_by
  ) values (
    'c0000000-0000-4000-8000-000000000001', 'Sem permissão', 'Franca', 'SP',
    '31000000-0000-4000-8000-000000000003', '31000000-0000-4000-8000-000000000003'
  )$$,
  '42501', null, 'técnico não deve cadastrar técnicos'
);

reset role;
select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select throws_ok(
  $$select public.unlink_technician_profile(
    'c0000000-0000-4000-8000-000000000001',
    (select id from public.technicians limit 1)
  )$$,
  '42501', 'insufficient_privilege', 'coordenador não deve alterar vínculo de profile'
);

select * from finish();
rollback;
