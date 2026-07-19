begin;

with target_user as (
  select
    users.id
  from auth.users as users
  where lower(users.email) = lower('pascoalotavio2@gmail.com')
),
created_organization as (
  insert into public.organizations (
    name,
    legal_name,
    tax_id,
    slug,
    timezone,
    active
  )
  values (
    'Github',
    'Github Ltda.',
    '10000000000000',
    'github-empresa',
    'America/Sao_Paulo',
    true
  )
  returning id
)
insert into public.organization_members (
  organization_id,
  profile_id,
  role,
  status
)
select
  organization.id,
  target_user.id,
  'admin'::public.organization_role,
  'active'::public.organization_member_status
from created_organization as organization
cross join target_user;

commit;