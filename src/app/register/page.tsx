
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [idPjlp, setIdPjlp] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('id_pjlp', idPjlp);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      // The server will now consistently return JSON.
      const data = await response.json();

      if (response.ok) {
        // Redirect on success
        router.push('/auth/verified');
      } else {
        // Set error from the JSON response
        setError(data.error || 'Terjadi kesalahan saat pendaftaran.');
      }
    } catch (e) {
      console.error(e);
      let errorMessage = 'Gagal terhubung ke server. Silakan coba lagi.';
      if (e instanceof SyntaxError) {
          errorMessage = "Menerima respons tidak valid dari server.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center py-10">
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
          <CardTitle className="font-headline text-2xl">Buat Akun Baru</CardTitle>
          <CardDescription>Daftarkan diri Anda sebagai anggota SIAP CUTI.</CardDescription>
        </CardHeader>
        <CardContent>
           {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Pendaftaran Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Sesuai KTP" required disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="id_pjlp">ID PJLP</Label>
              <Input id="id_pjlp" name="id_pjlp" placeholder="Contoh: 123456789" required disabled={isLoading} value={idPjlp} onChange={(e) => setIdPjlp(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input id="phone" name="phone" placeholder="0812xxxxxxxx" required type="tel" disabled={isLoading} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="Untuk verifikasi & notifikasi" required type="email" disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" placeholder="Minimal 6 karakter" disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Mendaftarkan...' : 'Daftar'}
            </Button>
            <div className="relative my-2">
              <Separator />
            </div>
            <div className="flex flex-col items-center space-y-2">
               <p className="px-8 text-center text-sm text-muted-foreground">
                 Sudah punya akun?{" "}
                <Link href="/" className="underline underline-offset-4 hover:text-primary">
                    Login di sini
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
