
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Endpoint ini akan dipanggil oleh GitHub Actions atau layanan cron eksternal lainnya.
// Endpoint ini dilindungi oleh secret key yang harus dikirim melalui Authorization header.

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // 1. Validasi Keamanan
  if (!cronSecret) {
    console.error("CRON_SECRET tidak diatur di environment variables.");
    return NextResponse.json({ message: 'Kesalahan konfigurasi server.' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: 'Akses ditolak: Token tidak valid.' }, { status: 401 });
  }

  // 2. Jalankan Fungsi SQL
  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.rpc('handle_new_year_leave_balances');

    if (error) {
      console.error("Gagal menjalankan fungsi RPC handle_new_year_leave_balances:", error);
      return NextResponse.json({ message: 'Gagal menjalankan fungsi reset saldo cuti.', error: error.message }, { status: 500 });
    }

    console.log("Reset saldo cuti tahunan berhasil dijalankan.");
    return NextResponse.json({ message: 'Reset saldo cuti tahunan berhasil dijalankan.' });

  } catch (err: any) {
    console.error("Terjadi kesalahan tak terduga saat proses cron:", err);
    return NextResponse.json({ message: 'Terjadi kesalahan tak terduga.', error: err.message }, { status: 500 });
  }
}
