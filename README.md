
# CUTI DAMKAR - Sistem Izin Siaga dan Berhalangan

**CUTI DAMKAR** adalah aplikasi web lengkap yang dirancang untuk mengelola proses pengajuan dan persetujuan cuti untuk anggota, khususnya ditujukan untuk organisasi seperti tim PJLP (Penyedia Jasa Lainnya Perorangan). Aplikasi ini menyediakan dua portal berbeda: satu untuk anggota mengajukan dan melacak cuti, dan satu lagi untuk admin mengelola anggota, meninjau pengajuan, dan melihat laporan.

Dibangun dengan tumpukan teknologi modern, aplikasi ini mengutamakan pengalaman pengguna yang bersih, responsivitas, dan keamanan data.

---

## ✨ Fitur Utama

Aplikasi ini dibagi menjadi dua peran utama: **Anggota** dan **Admin**.

### Portal Anggota
- **Autentikasi Aman**: Pengguna dapat mendaftar, login, dan mereset password mereka dengan aman melalui verifikasi email.
- **Dashboard Anggota**: Tampilan visual yang jelas mengenai sisa cuti tahunan, total cuti yang telah digunakan, dan rekap pengajuan terkini.
- **Formulir Pengajuan Cuti**: Antarmuka yang mudah digunakan untuk mengajukan cuti dengan validasi tanggal, durasi, dan alasan yang jelas.
- **Riwayat Cuti**: Halaman untuk melacak status semua pengajuan cuti (Menunggu, Disetujui, Ditolak) yang dapat difilter berdasarkan tahun.
- **Manajemen Profil**: Pengguna dapat melihat dan memperbarui informasi pribadi mereka seperti nama, ID PJLP, dan nomor telepon, serta mengubah password akun.

### Portal Admin
- **Dashboard Admin**: Ringkasan statistik penting, termasuk total anggota, jumlah pengajuan bulan ini, dan aktivitas pengajuan terkini yang memerlukan persetujuan.
- **Manajemen Anggota (CRUD)**: Admin dapat menambah, melihat, mengedit, dan menghapus data anggota dengan mudah. Terdapat juga fungsi pencarian untuk mempercepat pengelolaan.
- **Manajemen Cuti**: Antarmuka terpusat untuk meninjau, menyetujui, atau menolak pengajuan cuti dari anggota. Saat status diubah, notifikasi email otomatis dikirimkan kepada anggota.
- **Laporan Saldo Cuti**: Halaman laporan untuk melihat rekapitulasi saldo cuti (total, terpakai, sisa) untuk semua anggota, yang dapat difilter berdasarkan tahun dan dilengkapi fungsi pencarian.

---

## 🚀 Tumpukan Teknologi

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [ShadCN/UI](https://ui.shadcn.com/)
- **Formulir**: React Hook Form & Server Actions
- **Notifikasi Email**: [Resend](https://resend.com/)
- **Penjadwalan Otomatis**: [GitHub Actions](https://github.com/features/actions)

---

## 🛠️ Panduan Penyiapan Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah di bawah ini.

### 1. Prasyarat
- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- [npm](https://www.npmjs.com/get-npm), [yarn](https://yarnpkg.com/), atau [pnpm](https://pnpm.io/)
- Akun [Supabase](https://supabase.com/)
- Akun [GitHub](https://github.com/)

### 2. Kloning Repositori
```bash
git clone https://github.com/your-username/cuti-damkar.git
cd cuti-damkar
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Penyiapan Variabel Lingkungan
1.  **Dapatkan Kunci Supabase**:
    - Buka [Supabase Dashboard](https://app.supabase.com/) dan buat proyek baru.
    - Pergi ke **Project Settings > API**.
    - Salin **Project URL** dan **anon (public) key**.
    - Di bawah **Project API Keys**, salin juga **service_role key**.
2.  **Buat File `.env.local`**:
    - Di direktori utama proyek, buat file bernama `.env.local`.
    - Tambahkan kunci yang telah Anda salin. Anda juga perlu menyiapkan kunci dari Resend dan membuat kunci rahasia untuk Cron Job.

    ```.env.local
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_ANDA
    SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_ANDA

    # Resend (Opsional, untuk notifikasi email)
    RESEND_API_KEY=KUNCI_API_RESEND_ANDA
    RESEND_FROM_EMAIL=ALAMAT_EMAIL_PENGIRIM_ANDA # Contoh: no-reply@domainanda.com
    
    # Cron Job Secret Key (PENTING: Samakan nilai ini dengan Repository Secret di GitHub)
    CRON_SECRET=BUAT_PASSWORD_RAHASIA_YANG_KUAT_DAN_ACAK_DI_SINI
    ```

3.  **Jalankan Skema SQL (PENTING!)**:
    - Buka **SQL Editor** di dashboard Supabase Anda.
    - Salin **SELURUH KONTEN** dari file `/src/lib/supabase/schema.sql` di proyek ini.
    - **PENTING**: Jika Anda sudah pernah menjalankan skema sebelumnya, hapus semua yang ada di SQL Editor terlebih dahulu untuk memastikan Anda menggunakan versi terbaru.
    - Tempelkan ke SQL Editor dan klik **"RUN"**. Ini akan membuat semua tabel, fungsi, hak akses (RLS), dan optimasi indeks yang dibutuhkan.

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Aplikasi sekarang akan berjalan di [http://localhost:9002](http://localhost:9002).

---

## ⚙️ Konfigurasi Otomatisasi Reset Cuti Tahunan (PENTING!)

Aplikasi ini menggunakan **GitHub Actions** untuk menjalankan reset saldo cuti tahunan secara otomatis setiap tanggal 1 Januari. Ini adalah **pengaturan satu kali** yang penting agar aplikasi berfungsi penuh.

### Cara Konfigurasi:
1.  Pastikan proyek Anda sudah ada di repositori GitHub.
2.  Buka repositori GitHub proyek Anda.
3.  Pergi ke tab **Settings**.
4.  Di menu samping kiri, navigasi ke **Secrets and variables > Actions**.
5.  Di bagian "Repository secrets", klik **"New repository secret"** dan tambahkan dua *secret* berikut:
    *   **Nama Secret:** `APP_URL`
        *   **Isi (Value):** Masukkan URL utama tempat aplikasi Anda akan di-deploy (misalnya: `https://cuti-damkar.vercel.app`).
    *   **Nama Secret:** `CRON_SECRET`
        *   **Isi (Value):** Masukkan nilai yang **sama persis** dengan yang Anda definisikan untuk `CRON_SECRET` di file `.env.local` Anda.

Setelah *secrets* ini disimpan, GitHub Actions akan secara otomatis menjalankan reset cuti setiap tahun tanpa perlu intervensi manual.

---

## 🤝 Berkontribusi

Kontribusi dalam bentuk *pull request*, laporan *bug*, atau saran fitur sangat kami hargai.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
# Damkar
# Damkar
