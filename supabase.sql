-- 1. Create a table for public profiles
CREATE TABLE profiles (
  id uuid NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT,
  nip TEXT,
  pangkat TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'anggota',

  CONSTRAINT id_fk FOREIGN KEY(id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Add a check constraint to the role column
ALTER TABLE profiles
  ADD CONSTRAINT role_check CHECK (role IN ('admin', 'anggota'));

-- 3. Set up Row Level Security (RLS)
-- Enable RLS for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for authenticated users
CREATE POLICY "Public profiles are viewable by authenticated users." ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow admins to manage all profiles (optional, but recommended for admin features)
CREATE POLICY "Admins can manage all profiles." ON profiles
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );


-- 4. Create a trigger function to create a profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    'anggota' -- Default role is 'anggota'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Function to get user role (useful for RLS policies in other tables)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql;
