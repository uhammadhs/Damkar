-- supabase.sql

-- 1. Create Profiles Table
-- This table will store user profile information.
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  updated_at timestamp with time zone,
  name character varying,
  nip character varying,
  pangkat character varying,
  avatar_url character varying,
  role character varying DEFAULT 'anggota'::character varying,
  email character varying,
  golongan character varying,
  jabatan character varying,
  "satuanKerja" character varying,
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Enable Row Level Security (RLS)
-- Important for securing user data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create Function to Handle New Users
-- This function automatically creates a profile when a new user signs up in Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'anggota');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger for New User Function
-- This trigger calls the handle_new_user function whenever a new user is added to auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Create Function to Get User Role
-- A safe way to get the current user's role without causing recursion in RLS policies.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. Row Level Security Policies for 'profiles' table

-- CLEANUP: Drop all old policies first to ensure a clean slate.
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to select any profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admin to manage all profiles" ON public.profiles;


-- POLICY: Allow authenticated users to view all profiles.
CREATE POLICY "Allow authenticated users to select any profile" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- POLICY: Allow users to insert their own profile.
CREATE POLICY "Allow authenticated users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- POLICY: Allow users to update their own profile.
CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- POLICY: Allow admins to update any profile.
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- POLICY: Allow admins to delete any profile.
CREATE POLICY "Admins can delete any profile" ON public.profiles
  FOR DELETE USING (public.get_user_role() = 'admin');
