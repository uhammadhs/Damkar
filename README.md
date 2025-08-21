
# SIAP CUTI - Sistem Izin Siaga dan Berhalangan

**SIAP CUTI** adalah aplikasi web lengkap yang dirancang untuk mengelola proses pengajuan dan persetujuan cuti untuk anggota, khususnya ditujukan untuk organisasi seperti tim PJLP (Penyedia Jasa Lainnya Perorangan). Aplikasi ini menyediakan dua portal berbeda: satu untuk anggota mengajukan dan melacak cuti, dan satu lagi untuk admin mengelola anggota, meninjau pengajuan, dan melihat laporan.

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

---

## 🛠️ Panduan Penyiapan Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah di bawah ini.

### 1. Prasyarat
- [Node.js](https://nodejs.org/en/) (v18 atau lebih baru)
- [npm](https://www.npmjs.com/get-npm), [yarn](https://yarnpkg.com/), atau [pnpm](https://pnpm.io/)
- Akun [Supabase](https://supabase.com/)

### 2. Kloning Repositori
```bash
git clone https://github.com/your-username/siap-cuti.git
cd siap-cuti
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Penyiapan Supabase
1.  **Buat Proyek Baru**: Buka [Supabase Dashboard](https://app.supabase.com/) dan buat proyek baru.
2.  **Dapatkan Kunci API**:
    - Pergi ke **Project Settings > API**.
    - Salin **Project URL** dan **anon (public) key**.
    - Di bawah **Project API Keys**, salin juga **service_role key**.
3.  **Konfigurasi Variabel Lingkungan**:
    - Buat file bernama `.env.local` di direktori utama proyek.
    - Tambahkan kunci yang telah Anda salin ke dalam file tersebut. Anda juga perlu menyiapkan kunci API dari Resend jika ingin menggunakan notifikasi email.

    ```.env.local
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE_ANDA
    NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_ANDA
    SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_ANDA

    # Resend (Opsional, untuk notifikasi email)
    RESEND_API_KEY=KUNCI_API_RESEND_ANDA
    RESEND_FROM_EMAIL=ALAMAT_EMAIL_PENGIRIM_ANDA # Contoh: no-reply@domainanda.com
    ```
4.  **Jalankan Skema SQL**:
    - Buka **SQL Editor** di dashboard Supabase Anda.
    - Salin seluruh konten dari file `/src/lib/supabase/schema.sql` di proyek ini.
    - Tempelkan ke SQL Editor dan klik **"RUN"**. Ini akan membuat semua tabel, fungsi, *trigger*, dan kebijakan keamanan (RLS) yang dibutuhkan oleh aplikasi.

### 5. Jalankan Aplikasi
Setelah semua penyiapan selesai, Anda siap menjalankan server pengembangan.

```bash
npm run dev
```

Aplikasi sekarang akan berjalan di [http://localhost:9002](http://localhost:9002).

---

## 🤝 Berkontribusi

Kontribusi dalam bentuk *pull request*, laporan *bug*, atau saran fitur sangat kami hargai.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
