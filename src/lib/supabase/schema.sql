-- 1. Enable RLS
alter table profiles enable row level security;
alter table leave_requests enable row level security;
alter table leave_balances enable row level security;
alter table notifications enable row level security;


-- 2. Create Policies for `profiles`
-- Users can view their own profile.
create policy "Users can view their own profile."
on profiles for select
using ( auth.uid() = id );

-- Users can update their own profile.
create policy "Users can update their own profile."
on profiles for update
using ( auth.uid() = id )
with check ( auth.uid() = id );

-- Admins can view all profiles.
create policy "Admins can view all profiles."
on profiles for select
to authenticated
with check ( (select get_user_role()) = 'admin' );

-- Admins can update any profile.
create policy "Admins can update any profile."
on profiles for update
to authenticated
with check ( (select get_user_role()) = 'admin' );


-- 3. Create Policies for `leave_requests`
-- Users can CRUD their own leave requests.
create policy "Users can CRUD their own leave requests."
on leave_requests for all
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Admins can view all leave requests.
create policy "Admins can view all leave requests."
on leave_requests for select
to authenticated
with check ( (select get_user_role()) = 'admin' );

-- Admins can update any leave request.
create policy "Admins can update any leave request."
on leave_requests for update
to authenticated
with check ( (select get_user_role()) = 'admin' );


-- 4. Create Policies for `leave_balances`
-- Users can view their own leave balance.
create policy "Users can view their own leave balance."
on leave_balances for select
using ( auth.uid() = user_id );

-- Admins can CRUD leave balances. (e.g., for yearly resets)
create policy "Admins can CRUD leave balances."
on leave_balances for all
to authenticated
with check ( (select get_user_role()) = 'admin' );


-- 5. Create Policies for `notifications`
-- Users can view their own notifications.
create policy "Users can view their own notifications."
on notifications for select
using ( auth.uid() = user_id );

-- Admins can read all notifications.
create policy "Admins can read all notifications."
on notifications for select
to authenticated
with check ( (select get_user_role()) = 'admin' );


-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, id_pjlp, phone, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'id_pjlp',
    new.raw_user_meta_data->>'phone',
    new.email,
    'anggota' -- Default role
  );
  return new;
end;
$$;

-- Trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Function to update leave balance after a request is approved
create or replace function public.update_leave_balance()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  leave_duration int;
  request_year int;
begin
  -- Check if status is 'Disetujui'
  if new.status = 'Disetujui' and old.status <> 'Disetujui' then
    leave_duration := new.duration;
    request_year := extract(year from new.start_date);

    -- Check if a balance record for that year exists
    if exists (
      select 1
      from public.leave_balances
      where user_id = new.user_id and year = request_year
    ) then
      -- Update existing balance
      update public.leave_balances
      set used_days = used_days + leave_duration
      where user_id = new.user_id and year = request_year;
    else
      -- Create a new balance record for the year if it doesn't exist
      insert into public.leave_balances (user_id, year, total_days, used_days)
      values (new.user_id, request_year, 12, leave_duration);
    end if;
  end if;

  return new;
end;
$$;

-- Trigger to update balance on leave approval
create trigger on_leave_request_approved
  after update of status on public.leave_requests
  for each row
  execute procedure public.update_leave_balance();


-- Function to create notifications for admins when a new leave request is created
create or replace function public.create_admin_notification_for_new_leave()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    admin_record record;
    requesting_user_name text;
begin
    -- Get the name of the user who submitted the request
    select name into requesting_user_name from public.profiles where id = new.user_id;
    
    -- If the name is null, use a default
    if requesting_user_name is null then
        requesting_user_name := 'Seorang anggota';
    end if;

    -- Loop through all admin users and create a notification for each
    for admin_record in select id from public.profiles where role = 'admin' loop
        insert into public.notifications (user_id, leave_request_id, message)
        values (admin_record.id, new.id, requesting_user_name || ' telah mengajukan cuti baru.');
    end loop;
    
    return new;
end;
$$;

-- Trigger to create notifications for new leave requests
create trigger on_new_leave_request
  after insert on public.leave_requests
  for each row
  execute procedure public.create_admin_notification_for_new_leave();


-- Function to create leave balance if it doesn't exist on request creation
-- This "lazily" creates the leave balance for the year.
create or replace function public.create_leave_balance_if_not_exists()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    request_year int;
begin
    request_year := extract(year from new.start_date);
    
    -- Check if a balance record for that year exists for the user
    if not exists (
      select 1
      from public.leave_balances
      where user_id = new.user_id and year = request_year
    ) then
      -- Create a new balance record for the year if it doesn't exist
      insert into public.leave_balances (user_id, year, total_days, used_days)
      values (new.user_id, request_year, 12, 0); -- Default 12 days, 0 used
    end if;
    
    return new;
end;
$$;

-- Trigger to check for leave balance before a new request is inserted
create trigger trigger_check_leave_balance_on_insert
  before insert on public.leave_requests
  for each row
  execute procedure public.create_leave_balance_if_not_exists();
  
-- Function to get the role of the currently authenticated user
create or replace function public.get_user_role()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = auth.uid();
  
  return user_role;
end;
$$;
