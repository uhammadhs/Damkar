
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  // 1. Amankan endpoint dengan secret key
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createAdminClient();

  // 2. Panggil fungsi RPC yang sudah ada di database
  const { error } = await supabase.rpc('handle_new_year_leave_balances');

  if (error) {
    console.error('Cron job (reset-leave) failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // 3. Kembalikan respons sukses
  return NextResponse.json({ success: true, message: 'Annual leave balances reset successfully.' });
}
