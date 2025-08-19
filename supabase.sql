-- 1. Enable RLS
alter table public.profiles enable row level security;
alter table public.leave_requests enable row level security;
alter table public.leave_balances enable row level security;

-- 2. Create Policies

-- Profiles Table
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select to authenticated with bypass rls using (public.get_user_role() = 'admin');
create policy "Admins can update any profile" on public.profiles for update to authenticated with bypass rls using (public.get_user_role() = 'admin');
create policy "Admins can insert new profiles" on public.profiles for insert to authenticated with bypass rls using (public.get_user_role() = 'admin');
create policy "Admins can delete profiles" on public.profiles for delete to authenticated with bypass rls using (public.get_user_role() = 'admin');

-- Leave Requests Table
create policy "Users can view their own leave requests" on public.leave_requests for select using (auth.uid() = user_id);
create policy "Users can create leave requests" on public.leave_requests for insert with check (auth.uid() = user_id);
create policy "Admins can view all leave requests" on public.leave_requests for select to authenticated with bypass rls using (public.get_user_role() = 'admin');
create policy "Admins can update any leave request" on public.leave_requests for update to authenticated with bypass rls using (public.get_user_role() = 'admin');

-- Leave Balances Table
create policy "Users can view their own leave balances" on public.leave_balances for select using (auth.uid() = user_id);
create policy "Admins can manage leave balances" on public.leave_balances for all to authenticated with bypass rls using (public.get_user_role() = 'admin');


-- 3. Create Functions

-- Function to get user role
create or replace function public.get_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;


-- Function to handle new user and create a profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a profile for the new user
  insert into public.profiles (id, name, id_pjlp, phone, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'id_pjlp',
    new.raw_user_meta_data->>'phone',
    new.email,
    'anggota'
  );
  
  -- Create an initial leave balance for the new user for the current year
  insert into public.leave_balances (user_id, year, total_days, used_days)
  values (new.id, extract(year from current_date), 12, 0);
  
  return new;
end;
$$;


-- Function to update leave balance atomically
create or replace function public.update_leave_balance(p_user_id uuid, p_year integer, p_days_to_add integer)
returns void
language plpgsql
as $$
begin
  if not exists (select 1 from public.leave_balances where user_id = p_user_id and year = p_year) then
    -- If balance for the year doesn't exist, create it.
    insert into public.leave_balances(user_id, year, total_days, used_days)
    values (p_user_id, p_year, 12, p_days_to_add);
  else
    -- If it exists, update it.
    update public.leave_balances
    set used_days = used_days + p_days_to_add
    where user_id = p_user_id and year = p_year;
  end if;
end;
$$;


-- 4. Create Triggers
-- Trigger to call handle_new_user on new user sign-up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to cascade delete profile when auth user is deleted
drop trigger if exists on_auth_user_deleted on auth.users;
-- Note: Supabase handles profile deletion via foreign key cascade with `on delete cascade`.
-- Ensure the foreign key constraint from profiles.id to auth.users.id is set with ON DELETE CASCADE.
-- This is typically the default in Supabase projects. If not, it should be set manually.
-- The explicit trigger is an alternative if cascade is not set.

-- create trigger on_auth_user_deleted
--   after delete on auth.users
--   for each row execute procedure public.handle_user_delete();

-- create or replace function public.handle_user_delete()
-- returns trigger
-- language plpgsql
-- security definer
-- as $$
-- begin
--   delete from public.profiles where id = old.id;
--   return old;
-- end;
-- $$;
