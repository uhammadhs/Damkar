-- Hapus tabel yang ada jika ada untuk memulai dari awal
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.leave_types CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PROFILES
-- Tabel ini menyimpan data profil publik untuk setiap pengguna.
CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at timestamp with time zone,
    name text,
    nip text UNIQUE,
    pangkat text,
    golongan text,
    jabatan text,
    "satuanKerja" text,
    avatar_url text,
    role text DEFAULT 'anggota'::text
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- LEAVE TYPES
-- Tabel ini menyimpan jenis-jenis cuti yang tersedia.
CREATE TABLE public.leave_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;

-- LEAVE BALANCES
-- Tabel ini menyimpan jatah cuti tahunan untuk setiap pengguna.
CREATE TABLE public.leave_balances (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    year INT NOT NULL,
    total_days INT NOT NULL,
    used_days INT NOT NULL DEFAULT 0,
    CONSTRAINT unique_user_year UNIQUE (user_id, year)
);
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

-- LEAVE REQUESTS
-- Tabel ini menyimpan semua pengajuan cuti.
CREATE TABLE public.leave_requests (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type_id INT NOT NULL REFERENCES public.leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration INT NOT NULL,
    title TEXT NOT NULL,
    reason TEXT,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'Menunggu', -- Menunggu, Disetujui, Ditolak
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- FUNGSI & TRIGGER
-- Fungsi ini membuat profil baru setiap kali pengguna baru mendaftar di Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', 'anggota');
  -- Inisialisasi jatah cuti untuk tahun berjalan
  INSERT INTO public.leave_balances (user_id, year, total_days)
  VALUES (new.id, date_part('year', now()), 12);
  RETURN new;
END;
$$;

-- Trigger yang memanggil fungsi handle_new_user saat ada pengguna baru.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fungsi untuk mendapatkan peran pengguna saat ini.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  );
END;
$$;

-- RLS POLICIES
-- PROFILES
CREATE POLICY "Allow authenticated users to select any profile" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING ((get_user_role() = 'admin')) WITH CHECK ((get_user_role() = 'admin'));

-- LEAVE TYPES
CREATE POLICY "Allow authenticated users to read leave types" ON public.leave_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to manage leave types" ON public.leave_types FOR ALL USING ((get_user_role() = 'admin'));

-- LEAVE BALANCES
CREATE POLICY "Allow users to view their own leave balance" ON public.leave_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admin to view all leave balances" ON public.leave_balances FOR SELECT USING ((get_user_role() = 'admin'));
CREATE POLICY "Allow admin to manage leave balances" ON public.leave_balances FOR ALL USING ((get_user_role() = 'admin'));

-- LEAVE REQUESTS
CREATE POLICY "Allow users to manage their own leave requests" ON public.leave_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow admin to view all leave requests" ON public.leave_requests FOR SELECT USING ((get_user_role() = 'admin'));
CREATE POLICY "Allow admin to update leave requests" ON public.leave_requests FOR UPDATE USING ((get_user_role() = 'admin'));

-- SEED DATA AWAL
-- Masukkan beberapa jenis cuti default
INSERT INTO public.leave_types (name, description) VALUES
('Cuti Tahunan', 'Cuti tahunan yang menjadi hak pegawai'),
('Cuti Sakit', 'Izin tidak masuk kerja karena sakit'),
('Cuti Alasan Penting', 'Izin untuk keperluan mendesak seperti keluarga sakit atau duka'),
('Cuti Melahirkan', 'Cuti untuk persalinan dan pemulihan'),
('Cuti Besar', 'Cuti untuk pegawai yang telah bekerja dalam jangka waktu tertentu');
