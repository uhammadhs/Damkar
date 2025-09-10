
-- ----------------------------
-- Enable Realtime for tables
-- ----------------------------
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table notifications;

-- ----------------------------
-- Create Profiles Table
-- ----------------------------
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamptz,
    name text,
    avatar_url text,
    id_pjlp text UNIQUE,
    phone text,
    email text UNIQUE,
    role text DEFAULT 'anggota'
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------
-- Create Leave Requests Table
-- ----------------------------
CREATE TABLE public.leave_requests (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    duration integer NOT NULL,
    reason text,
    status text NOT NULL DEFAULT 'Menunggu',
    attachment_url text,
    is_read_by_user boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- ----------------------------
-- Create Leave Balances Table
-- ----------------------------
CREATE TABLE public.leave_balances (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    year integer NOT NULL,
    total_days integer NOT NULL DEFAULT 12,
    used_days integer NOT NULL DEFAULT 0,
    UNIQUE (user_id, year)
);
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- ----------------------------
-- Create Notifications Table
-- ----------------------------
CREATE TABLE public.notifications (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_request_id bigint NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ----------------------------
-- RLS Policies for Profiles
-- ----------------------------
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile." 
ON public.profiles FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete any profile."
ON public.profiles FOR DELETE USING (public.get_user_role() = 'admin');

-- ----------------------------
-- RLS Policies for Leave Requests
-- ----------------------------
CREATE POLICY "Users can view their own leave requests." 
ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create leave requests." 
ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all leave requests." 
ON public.leave_requests FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update any leave request." 
ON public.leave_requests FOR UPDATE USING (public.get_user_role() = 'admin');

-- ----------------------------
-- RLS Policies for Leave Balances
-- ----------------------------
CREATE POLICY "Users can view their own leave balances." 
ON public.leave_balances FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all leave balances." 
ON public.leave_balances FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Enable all for service_role"
ON public.leave_balances FOR ALL USING (true);

-- ----------------------------
-- RLS Policies for Notifications
-- ----------------------------
CREATE POLICY "Users can view their own notifications." 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications."
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ----------------------------
-- Function to get user role
-- ----------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


-- ----------------------------
-- Function and Trigger to handle new user
-- ----------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, id_pjlp, phone)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'name',
        new.email,
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'id_pjlp',
        new.raw_user_meta_data->>'phone'
    );
    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------
-- Function and Trigger to create initial leave balance
-- ----------------------------
CREATE OR REPLACE FUNCTION public.on_new_user_create_leave_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.leave_balances (user_id, year, total_days, used_days)
  VALUES (new.id, date_part('year', now()), 12, 0);
  RETURN new;
END;
$$;

CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.on_new_user_create_leave_balance();

-- ----------------------------
-- Function and Trigger to create admin notifications
-- ----------------------------
CREATE OR REPLACE FUNCTION public.create_admin_notification_for_new_leave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record record;
  applicant_name text;
BEGIN
  -- Get the applicant's name
  SELECT name INTO applicant_name FROM public.profiles WHERE id = NEW.user_id;

  -- Loop through all admins and create a notification for each
  FOR admin_record IN SELECT id FROM public.profiles WHERE role = 'admin' LOOP
    INSERT INTO public.notifications (user_id, leave_request_id, message)
    VALUES (admin_record.id, NEW.id, applicant_name || ' mengajukan cuti baru: ' || NEW.title);
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_leave_request
AFTER INSERT ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.create_admin_notification_for_new_leave();


-- ----------------------------
-- Function to handle yearly leave balance reset (for Cron Job)
-- ----------------------------
CREATE OR REPLACE FUNCTION public.handle_new_year_leave_balances()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    anggota_record record;
    current_year integer;
BEGIN
    current_year := date_part('year', now());
    FOR anggota_record IN SELECT id FROM public.profiles WHERE role = 'anggota' LOOP
        -- Check if a balance for the current year already exists
        IF NOT EXISTS (SELECT 1 FROM public.leave_balances WHERE user_id = anggota_record.id AND year = current_year) THEN
            -- If not, insert a new balance entry for the new year
            INSERT INTO public.leave_balances (user_id, year, total_days, used_days)
            VALUES (anggota_record.id, current_year, 12, 0);
        END IF;
    END LOOP;
END;
$$;


-- ----------------------------
-- Grant permissions
-- ----------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
