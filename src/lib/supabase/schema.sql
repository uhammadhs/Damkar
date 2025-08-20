
-- Aktifkan RLS (Row Level Security) untuk tabel.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Buat kebijakan (policies) RLS.

-- PROFILES Table
-- 1. Izinkan pengguna untuk melihat semua profil (untuk fungsionalitas seperti dropdown nama).
CREATE POLICY "Allow authenticated users to view all profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
-- 2. Izinkan pengguna untuk memperbarui profil mereka sendiri.
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- LEAVE_REQUESTS Table
-- 1. Izinkan pengguna untuk mengelola (melihat, membuat, mengubah) pengajuan cuti mereka sendiri.
CREATE POLICY "Allow users to manage their own leave requests" ON public.leave_requests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- 2. Izinkan admin untuk melihat semua pengajuan cuti.
CREATE POLICY "Allow admin to view all leave requests" ON public.leave_requests FOR SELECT USING ((SELECT get_user_role()) = 'admin');
-- 3. Izinkan admin untuk memperbarui semua pengajuan cuti (menyetujui/menolak).
CREATE POLICY "Allow admin to update all leave requests" ON public.leave_requests FOR UPDATE USING ((SELECT get_user_role()) = 'admin') WITH CHECK ((SELECT get_user_role()) = 'admin');

-- LEAVE_BALANCES Table
-- 1. Izinkan anggota untuk melihat saldo mereka sendiri DAN membuat data saldo baru untuk diri mereka sendiri.
CREATE POLICY "Members can view and create their own leave balance." ON public.leave_balances
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- 2. Izinkan admin untuk melihat semua data saldo cuti.
CREATE POLICY "Admins can view all leave balances." ON public.leave_balances
  FOR SELECT USING ((SELECT get_user_role()) = 'admin');

-- NOTIFICATIONS Table
-- 1. Izinkan admin untuk melihat notifikasi yang ditujukan untuk mereka.
CREATE POLICY "Allow admin to see their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id AND (SELECT get_user_role()) = 'admin');
-- 2. Izinkan admin untuk memperbarui notifikasi mereka (menandai sebagai sudah dibaca).
CREATE POLICY "Allow admin to update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id AND (SELECT get_user_role()) = 'admin');


-- FUNCTIONS AND TRIGGERS

-- Fungsi untuk mendapatkan peran pengguna saat ini.
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Fungsi untuk membuat profil baru saat pengguna baru mendaftar.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, id_pjlp, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'id_pjlp',
    new.raw_user_meta_data->>'phone',
    'anggota' -- Default role
  );
  RETURN new;
END;
$$;

-- Trigger yang memanggil handle_new_user() setelah pengguna baru dibuat di auth.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Fungsi untuk memperbarui saldo cuti saat pengajuan disetujui atau dibatalkan.
CREATE OR REPLACE FUNCTION public.handle_leave_balance_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  leave_duration INT;
  leave_year INT;
BEGIN
  leave_duration := OLD.duration;
  leave_year := EXTRACT(YEAR FROM OLD.start_date);

  -- Jika status berubah MENJADI 'Disetujui'
  IF NEW.status = 'Disetujui' AND OLD.status <> 'Disetujui' THEN
    UPDATE public.leave_balances
    SET used_days = used_days + leave_duration
    WHERE user_id = OLD.user_id AND year = leave_year;
  -- Jika status berubah DARI 'Disetujui' ke status lain
  ELSIF OLD.status = 'Disetujui' AND NEW.status <> 'Disetujui' THEN
    UPDATE public.leave_balances
    SET used_days = used_days - leave_duration
    WHERE user_id = OLD.user_id AND year = leave_year;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger yang memanggil handle_leave_balance_update() saat status pengajuan berubah.
CREATE OR REPLACE TRIGGER on_leave_request_status_change
  AFTER UPDATE OF status ON public.leave_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE PROCEDURE public.handle_leave_balance_update();

-- Fungsi untuk membuat notifikasi untuk admin saat ada pengajuan cuti baru.
CREATE OR REPLACE FUNCTION public.create_admin_notification_for_new_leave()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user RECORD;
  applicant_name TEXT;
BEGIN
  -- Dapatkan nama pemohon
  SELECT name INTO applicant_name FROM public.profiles WHERE id = NEW.user_id;

  -- Ulangi untuk setiap admin dan buat notifikasi
  FOR admin_user IN (SELECT id FROM public.profiles WHERE role = 'admin')
  LOOP
    INSERT INTO public.notifications (user_id, leave_request_id, message)
    VALUES (admin_user.id, NEW.id, applicant_name || ' telah mengajukan cuti baru: ' || NEW.title);
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger yang memanggil create_admin_notification_for_new_leave() saat ada pengajuan baru.
CREATE OR REPLACE TRIGGER on_leave_request_inserted
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_admin_notification_for_new_leave();

-- Fungsi baru untuk membuat saldo cuti jika belum ada untuk tahun berjalan.
CREATE OR REPLACE FUNCTION public.create_leave_balance_if_not_exists()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year INT;
BEGIN
  v_year := EXTRACT(YEAR FROM NEW.start_date);
  
  -- Periksa apakah saldo untuk tahun ini sudah ada
  IF NOT EXISTS (
    SELECT 1
    FROM public.leave_balances
    WHERE user_id = NEW.user_id AND year = v_year
  ) THEN
    -- Jika tidak ada, buat baris saldo baru dengan default 12 hari.
    INSERT INTO public.leave_balances (user_id, year, total_days, used_days)
    VALUES (NEW.user_id, v_year, 12, 0);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger baru yang memanggil fungsi di atas SEBELUM pengajuan cuti dimasukkan.
CREATE OR REPLACE TRIGGER trigger_check_leave_balance_on_insert
  BEFORE INSERT ON public.leave_requests
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_leave_balance_if_not_exists();

