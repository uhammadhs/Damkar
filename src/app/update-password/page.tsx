
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
import { updatePassword } from './actions';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    const result = await updatePassword(formData);

    if (result.success) {
      // Redirect to login page with a success message
      router.push(`/?message=${encodeURIComponent(result.message || 'Password berhasil diubah. Silakan login.')}`);
    } else {
      setError(result.error || 'Terjadi kesalahan.');
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
