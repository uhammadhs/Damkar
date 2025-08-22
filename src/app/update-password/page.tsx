"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const PasswordSchema = z.object({
    password: z.string().min(6, 'Password baru harus terdiri dari setidaknya 6 karakter.'),
    confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
    message: 'Password dan konfirmasi tidak cocok.',
    path: ['confirm_password']
});


export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Check for password recovery error in URL hash on mount
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const errorDescription = params.get('error_description');
      if (errorDescription) {
        setError(errorDescription);
      }
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const validation = PasswordSchema.safeParse(data);

    if (!validation.success) {
      const formError = validation.error.errors[0].message;
      setError(formError);
      setLoading(false);
      return;
    }

    const { password } = validation.data;

    // Supabase client automatically handles the session from the URL hash
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message || 'Gagal memperbarui password. Sesi Anda mungkin sudah kedaluwarsa. Silakan coba minta reset password lagi.');
    } else {
      // Redirect to login page with a success message
      const message = encodeURIComponent('Password berhasil diubah. Silakan login dengan password baru Anda.');
      router.push(`/?message=${message}`);
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Background"
        fill
        objectFit="cover"
        className="z-0 opacity-20"
        data-ai-hint="firefighter heroic"
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="z-10 w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Buat Password Baru</CardTitle>
          <CardDescription>Masukkan password baru Anda di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password"
                disabled={loading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm_password">Konfirmasi Password</Label>
              <Input 
                id="confirm_password" 
                name="confirm_password" 
                placeholder="••••••••" 
                required 
                type="password"
                disabled={loading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
            <Button variant="link" asChild className="w-full">
                <Link href="/">Kembali ke Login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
