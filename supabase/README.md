# Supabase

## Desenvolvimento local

As migrations são a fonte de verdade do schema. Para reconstruir e validar o
banco local:

```bash
SUPABASE_TELEMETRY_DISABLED=1 pnpm exec supabase start
SUPABASE_TELEMETRY_DISABLED=1 pnpm exec supabase db reset --local
SUPABASE_TELEMETRY_DISABLED=1 pnpm exec supabase test db --local
SUPABASE_TELEMETRY_DISABLED=1 pnpm exec supabase db lint --local --schema public,private --level error --fail-on error
```

Nunca execute `db reset --linked` em um projeto com dados importantes.

## Bootstrap da primeira organização

1. Aplique as migrations versionadas no projeto Supabase Cloud.
2. Crie o primeiro usuário em **Authentication > Users**, com e-mail e senha.
3. Confirme o e-mail quando a configuração de Auth exigir.
4. No SQL Editor, valide se o trigger criou o profile:

```sql
select
  auth_user.id,
  auth_user.email,
  profile.id as profile_id,
  profile.active
from auth.users as auth_user
left join public.profiles as profile on profile.id = auth_user.id
where lower(auth_user.email) = lower('admin@sua-empresa.com');
```

Troque o e-mail do exemplo antes de executar. Caso um usuário anterior à
migration não possua profile, faça o backfill sem informar UUID manualmente:

```sql
insert into public.profiles (id, name, email, phone)
select
  auth_user.id,
  nullif(btrim(auth_user.raw_user_meta_data ->> 'name'), ''),
  auth_user.email,
  nullif(btrim(auth_user.phone), '')
from auth.users as auth_user
where lower(auth_user.email) = lower('admin@sua-empresa.com')
on conflict (id) do nothing;
```

Depois, crie a organização e o primeiro vínculo administrativo em uma única
transação. Ajuste os valores declarados antes de executar:

```sql
begin;

do $$
declare
  first_user_email constant text := 'admin@sua-empresa.com';
  first_organization_name constant text := 'Sua Empresa';
  first_organization_slug constant text := 'sua-empresa';
  first_organization_timezone constant text := 'America/Sao_Paulo';
  first_profile_id uuid;
  first_organization_id uuid;
begin
  select auth_user.id
  into strict first_profile_id
  from auth.users as auth_user
  where lower(auth_user.email) = lower(first_user_email);

  select organization.id
  into first_organization_id
  from public.organizations as organization
  where organization.slug = first_organization_slug;

  if first_organization_id is null then
    insert into public.organizations (name, slug, timezone)
    values (
      first_organization_name,
      first_organization_slug,
      first_organization_timezone
    )
    returning id into first_organization_id;
  end if;

  insert into public.organization_members (
    organization_id,
    profile_id,
    role,
    status
  )
  values (
    first_organization_id,
    first_profile_id,
    'admin',
    'active'
  )
  on conflict (organization_id, profile_id)
  do update set role = 'admin', status = 'active';
end;
$$;

commit;
```

Por fim, entre na aplicação. Um usuário com apenas uma organização ativa
será direcionado de `/app` para `/app/{slug}/dashboard`.

O bootstrap deve ser executado somente por um administrador do banco. A
aplicação não utiliza chave `service_role` e usuários autenticados não recebem
permissões de escrita nessas tabelas nesta etapa.
