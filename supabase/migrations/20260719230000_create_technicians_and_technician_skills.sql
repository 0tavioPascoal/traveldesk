alter table public.skills
  add constraint skills_organization_id_id_key unique (organization_id, id);

create table public.technicians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  profile_id uuid,
  name text not null,
  document text,
  email text,
  phone text,
  job_title text,
  base_city text not null,
  base_state text not null,
  driver_license_number text,
  driver_license_category text,
  driver_license_expires_at date,
  can_drive_company_vehicle boolean not null default false,
  notes text,
  active boolean not null default true,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technicians_organization_id_fkey
    foreign key (organization_id) references public.organizations (id) on delete restrict,
  constraint technicians_profile_id_fkey
    foreign key (profile_id) references public.profiles (id) on delete restrict,
  constraint technicians_profile_membership_fkey
    foreign key (organization_id, profile_id)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technicians_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint technicians_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint technicians_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technicians_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technicians_organization_id_id_key unique (organization_id, id),
  constraint technicians_name_format check (
    name = btrim(name) and char_length(name) between 2 and 160
  ),
  constraint technicians_document_format check (
    document is null or document ~ '^[0-9]{11}$'
  ),
  constraint technicians_email_format check (
    email is null or (
      email = lower(btrim(email)) and char_length(email) between 3 and 254
    )
  ),
  constraint technicians_phone_format check (
    phone is null or phone ~ '^[0-9]{10,11}$'
  ),
  constraint technicians_job_title_format check (
    job_title is null or (
      job_title = btrim(job_title) and char_length(job_title) between 1 and 120
    )
  ),
  constraint technicians_base_city_format check (
    base_city = btrim(base_city) and char_length(base_city) between 2 and 120
  ),
  constraint technicians_base_state_format check (base_state ~ '^[A-Z]{2}$'),
  constraint technicians_driver_license_number_format check (
    driver_license_number is null or driver_license_number ~ '^[0-9]{11}$'
  ),
  constraint technicians_driver_license_category_check check (
    driver_license_category is null
    or driver_license_category in ('A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE')
  ),
  constraint technicians_driver_eligibility_check check (
    not can_drive_company_vehicle or (
      driver_license_number is not null
      and driver_license_category is not null
      and driver_license_expires_at is not null
    )
  ),
  constraint technicians_notes_format check (
    notes is null or (
      notes = btrim(notes) and char_length(notes) between 1 and 2000
    )
  )
);

create table public.technician_skills (
  organization_id uuid not null,
  technician_id uuid not null,
  skill_id uuid not null,
  proficiency_level smallint not null,
  is_primary boolean not null default false,
  created_by uuid not null,
  updated_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technician_skills_pkey primary key (organization_id, technician_id, skill_id),
  constraint technician_skills_technician_fkey
    foreign key (organization_id, technician_id)
    references public.technicians (organization_id, id) on delete cascade,
  constraint technician_skills_skill_fkey
    foreign key (organization_id, skill_id)
    references public.skills (organization_id, id) on delete restrict,
  constraint technician_skills_created_by_fkey
    foreign key (created_by) references public.profiles (id) on delete restrict,
  constraint technician_skills_updated_by_fkey
    foreign key (updated_by) references public.profiles (id) on delete restrict,
  constraint technician_skills_created_by_membership_fkey
    foreign key (organization_id, created_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technician_skills_updated_by_membership_fkey
    foreign key (organization_id, updated_by)
    references public.organization_members (organization_id, profile_id) on delete restrict,
  constraint technician_skills_proficiency_level_check
    check (proficiency_level between 1 and 5)
);

create unique index technicians_organization_document_key
  on public.technicians (organization_id, document) where document is not null;
create unique index technicians_organization_email_key
  on public.technicians (organization_id, email) where email is not null;
create unique index technicians_organization_profile_key
  on public.technicians (organization_id, profile_id) where profile_id is not null;
create index technicians_organization_active_name_idx
  on public.technicians (organization_id, active, name);
create index technicians_organization_base_state_idx
  on public.technicians (organization_id, base_state);
create index technician_skills_skill_idx
  on public.technician_skills (organization_id, skill_id, technician_id);
create unique index technician_skills_one_primary_key
  on public.technician_skills (organization_id, technician_id) where is_primary;

create trigger technicians_set_updated_at
before update on public.technicians
for each row execute function private.set_updated_at();

create trigger technician_skills_set_updated_at
before update on public.technician_skills
for each row execute function private.set_updated_at();

create function private.is_active_skill(target_organization_id uuid, target_skill_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.skills
    where organization_id = target_organization_id
      and id = target_skill_id
      and active
  );
$$;

create function private.is_current_user_technician(
  target_organization_id uuid,
  target_technician_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.technicians
    where organization_id = target_organization_id
      and id = target_technician_id
      and profile_id = (select auth.uid())
  ) and (select private.is_active_organization_member(target_organization_id));
$$;

create function private.validate_technician_profile_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.profile_id is not null and (
    tg_op = 'INSERT'
    or old.profile_id is distinct from new.profile_id
    or old.organization_id is distinct from new.organization_id
  ) then
    if not exists (
      select 1
      from public.organization_members membership
      join public.profiles profile on profile.id = membership.profile_id
      join public.organizations organization on organization.id = membership.organization_id
      where membership.organization_id = new.organization_id
        and membership.profile_id = new.profile_id
        and membership.status = 'active'::public.organization_member_status
        and profile.active
        and organization.active
    ) then
      raise exception using errcode = 'P0001', message = 'technician_profile_not_eligible';
    end if;
  end if;
  return new;
end;
$$;

create trigger technicians_validate_profile_membership
before insert or update of organization_id, profile_id on public.technicians
for each row execute function private.validate_technician_profile_membership();

revoke all on function private.is_active_skill(uuid, uuid) from public, anon, authenticated;
revoke all on function private.is_current_user_technician(uuid, uuid) from public, anon, authenticated;
revoke all on function private.validate_technician_profile_membership() from public, anon, authenticated;
grant execute on function private.is_active_skill(uuid, uuid) to authenticated;
grant execute on function private.is_current_user_technician(uuid, uuid) to authenticated;

revoke all on public.technicians from anon, authenticated;
revoke all on public.technician_skills from anon, authenticated;
grant select on public.technicians to authenticated;
grant insert (
  organization_id, name, document, email, phone, job_title, base_city, base_state,
  driver_license_number, driver_license_category, driver_license_expires_at,
  can_drive_company_vehicle, notes, active, created_by, updated_by
) on public.technicians to authenticated;
grant update (
  name, document, email, phone, job_title, base_city, base_state,
  driver_license_number, driver_license_category, driver_license_expires_at,
  can_drive_company_vehicle, notes, active, updated_by
) on public.technicians to authenticated;
grant select, delete on public.technician_skills to authenticated;
grant insert (
  organization_id, technician_id, skill_id, proficiency_level, is_primary,
  created_by, updated_by
) on public.technician_skills to authenticated;
grant update (proficiency_level, is_primary, updated_by)
  on public.technician_skills to authenticated;

alter table public.technicians enable row level security;
alter table public.technician_skills enable row level security;

create policy technicians_select_administrative on public.technicians
for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy technicians_select_own on public.technicians
for select to authenticated using (
  profile_id = (select auth.uid())
  and (select private.is_active_organization_member(organization_id))
);
create policy technicians_insert_administrative on public.technicians
for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and profile_id is null
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);
create policy technicians_update_administrative on public.technicians
for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and updated_by = (select auth.uid())
);

create policy technician_skills_select_administrative on public.technician_skills
for select to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);
create policy technician_skills_select_own on public.technician_skills
for select to authenticated using (
  (select private.is_current_user_technician(organization_id, technician_id))
);
create policy technician_skills_insert_administrative on public.technician_skills
for insert to authenticated with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and (select private.is_active_skill(organization_id, skill_id))
  and created_by = (select auth.uid())
  and updated_by = (select auth.uid())
);
create policy technician_skills_update_administrative on public.technician_skills
for update to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
) with check (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
  and updated_by = (select auth.uid())
);
create policy technician_skills_delete_administrative on public.technician_skills
for delete to authenticated using (
  (select private.has_organization_role(
    organization_id, array['admin', 'coordinator']::public.organization_role[]
  ))
);

create function public.create_technician_with_skills(
  p_organization_id uuid, p_name text, p_document text, p_email text, p_phone text,
  p_job_title text, p_base_city text, p_base_state text,
  p_driver_license_number text, p_driver_license_category text,
  p_driver_license_expires_at date, p_can_drive_company_vehicle boolean,
  p_notes text, p_skills jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_technician_id uuid;
begin
  if jsonb_typeof(coalesce(p_skills, '[]'::jsonb)) <> 'array' then
    raise exception using errcode = 'P0001', message = 'invalid_skill_assignments';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
      as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
    group by skill_id having count(*) > 1
  ) or (
    select count(*) from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
      as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
    where coalesce(is_primary, false)
  ) > 1 then
    raise exception using errcode = 'P0001', message = 'invalid_skill_assignments';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
      as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
    left join public.skills skill
      on skill.organization_id = p_organization_id and skill.id = assignment.skill_id
    where skill.id is null or not skill.active
      or assignment.proficiency_level not between 1 and 5
  ) then
    raise exception using errcode = 'P0001', message = 'skill_not_available';
  end if;

  insert into public.technicians (
    organization_id, name, document, email, phone, job_title, base_city, base_state,
    driver_license_number, driver_license_category, driver_license_expires_at,
    can_drive_company_vehicle, notes, created_by, updated_by
  ) values (
    p_organization_id, p_name, p_document, p_email, p_phone, p_job_title,
    p_base_city, p_base_state, p_driver_license_number, p_driver_license_category,
    p_driver_license_expires_at, p_can_drive_company_vehicle, p_notes,
    auth.uid(), auth.uid()
  ) returning id into new_technician_id;

  insert into public.technician_skills (
    organization_id, technician_id, skill_id, proficiency_level, is_primary,
    created_by, updated_by
  )
  select p_organization_id, new_technician_id, assignment.skill_id,
    assignment.proficiency_level, coalesce(assignment.is_primary, false),
    auth.uid(), auth.uid()
  from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
    as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean);

  return new_technician_id;
end;
$$;

create function public.update_technician_with_skills(
  p_organization_id uuid, p_technician_id uuid, p_name text, p_document text,
  p_email text, p_phone text, p_job_title text, p_base_city text, p_base_state text,
  p_driver_license_number text, p_driver_license_category text,
  p_driver_license_expires_at date, p_can_drive_company_vehicle boolean,
  p_notes text, p_skills jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(coalesce(p_skills, '[]'::jsonb)) <> 'array' then
    raise exception using errcode = 'P0001', message = 'invalid_skill_assignments';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
      as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
    group by skill_id having count(*) > 1
  ) or (
    select count(*) from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
      as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
    where coalesce(is_primary, false)
  ) > 1 then
    raise exception using errcode = 'P0001', message = 'invalid_skill_assignments';
  end if;
  if exists (
    select 1
    from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
      as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
    left join public.skills skill
      on skill.organization_id = p_organization_id and skill.id = assignment.skill_id
    left join public.technician_skills existing
      on existing.organization_id = p_organization_id
      and existing.technician_id = p_technician_id
      and existing.skill_id = assignment.skill_id
    where skill.id is null
      or (not skill.active and existing.skill_id is null)
      or assignment.proficiency_level not between 1 and 5
  ) then
    raise exception using errcode = 'P0001', message = 'skill_not_available';
  end if;

  update public.technicians set
    name = p_name, document = p_document, email = p_email, phone = p_phone,
    job_title = p_job_title, base_city = p_base_city, base_state = p_base_state,
    driver_license_number = p_driver_license_number,
    driver_license_category = p_driver_license_category,
    driver_license_expires_at = p_driver_license_expires_at,
    can_drive_company_vehicle = p_can_drive_company_vehicle,
    notes = p_notes, updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_technician_id;
  if not found then return false; end if;

  delete from public.technician_skills existing
  where existing.organization_id = p_organization_id
    and existing.technician_id = p_technician_id
    and not exists (
      select 1 from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
        as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
      where assignment.skill_id = existing.skill_id
    );

  update public.technician_skills
  set is_primary = false, updated_by = auth.uid()
  where organization_id = p_organization_id
    and technician_id = p_technician_id
    and is_primary;

  insert into public.technician_skills (
    organization_id, technician_id, skill_id, proficiency_level, is_primary,
    created_by, updated_by
  )
  select p_organization_id, p_technician_id, assignment.skill_id,
    assignment.proficiency_level, coalesce(assignment.is_primary, false),
    auth.uid(), auth.uid()
  from jsonb_to_recordset(coalesce(p_skills, '[]'::jsonb))
    as assignment(skill_id uuid, proficiency_level smallint, is_primary boolean)
  on conflict (organization_id, technician_id, skill_id) do update set
    proficiency_level = excluded.proficiency_level,
    is_primary = excluded.is_primary,
    updated_by = auth.uid();
  return true;
end;
$$;

create function public.list_available_technician_profiles(
  p_organization_id uuid, p_technician_id uuid default null
)
returns table (id uuid, name text, email text)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.id, profile.name, profile.email
  from public.organization_members membership
  join public.profiles profile on profile.id = membership.profile_id
  where membership.organization_id = p_organization_id
    and membership.status = 'active'::public.organization_member_status
    and profile.active
    and private.has_organization_role(
      p_organization_id, array['admin']::public.organization_role[]
    )
    and not exists (
      select 1 from public.technicians technician
      where technician.organization_id = p_organization_id
        and technician.profile_id = profile.id
        and (p_technician_id is null or technician.id <> p_technician_id)
    )
  order by coalesce(profile.name, profile.email, profile.id::text);
$$;

create function public.link_technician_profile(
  p_organization_id uuid, p_technician_id uuid, p_profile_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_organization_role(
    p_organization_id, array['admin']::public.organization_role[]
  ) then raise exception using errcode = '42501', message = 'insufficient_privilege'; end if;
  update public.technicians set profile_id = p_profile_id, updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_technician_id;
  return found;
end;
$$;

create function public.unlink_technician_profile(
  p_organization_id uuid, p_technician_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_organization_role(
    p_organization_id, array['admin']::public.organization_role[]
  ) then raise exception using errcode = '42501', message = 'insufficient_privilege'; end if;
  update public.technicians set profile_id = null, updated_by = auth.uid()
  where organization_id = p_organization_id and id = p_technician_id;
  return found;
end;
$$;

revoke all on function public.create_technician_with_skills(uuid, text, text, text, text, text, text, text, text, text, date, boolean, text, jsonb) from public, anon;
revoke all on function public.update_technician_with_skills(uuid, uuid, text, text, text, text, text, text, text, text, text, date, boolean, text, jsonb) from public, anon;
revoke all on function public.list_available_technician_profiles(uuid, uuid) from public, anon;
revoke all on function public.link_technician_profile(uuid, uuid, uuid) from public, anon;
revoke all on function public.unlink_technician_profile(uuid, uuid) from public, anon;
grant execute on function public.create_technician_with_skills(uuid, text, text, text, text, text, text, text, text, text, date, boolean, text, jsonb) to authenticated;
grant execute on function public.update_technician_with_skills(uuid, uuid, text, text, text, text, text, text, text, text, text, date, boolean, text, jsonb) to authenticated;
grant execute on function public.list_available_technician_profiles(uuid, uuid) to authenticated;
grant execute on function public.link_technician_profile(uuid, uuid, uuid) to authenticated;
grant execute on function public.unlink_technician_profile(uuid, uuid) to authenticated;
