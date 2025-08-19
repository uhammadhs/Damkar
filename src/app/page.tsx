
"use client"

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error');
  const initialMessage = searchParams.get('message');

  const [isLoading, setIsLoading] = React.useState(false);
  const [id_pjlp, setIdPjlp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(initialError);
  const [message, setMessage] = React.useState<string | null>(initialMessage);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.append('id_pjlp', id_pjlp);
    formData.append('password', password);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok && response.redirected) {
          router.push(response.url);
          return;
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.error || 'Terjadi kesalahan yang tidak diketahui.');
        } catch (e) {
          setError('Gagal memproses respons dari server. Silakan coba lagi.');
        }
      }

    } catch (e) {
      console.error(e);
      let errorMessage = 'Gagal terhubung ke server. Silakan coba lagi.';
      if (e instanceof SyntaxError) {
          errorMessage = "Menerima respons tidak valid dari server. Hubungi admin.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle className="font-headline text-2xl">SIAP CUTI</CardTitle>
          <CardDescription>Sistem Izin Siaga dan Berhalangan</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
           {message && (
            <Alert variant="default" className="mb-4 border-green-500 text-green-700 dark:border-green-600 dark:text-green-400 [&>svg]:text-green-500 dark:[&>svg]:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Sukses</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="id_pjlp">ID PJLP</Label>
              <Input 
                id="id_pjlp" 
                name="id_pjlp" 
                placeholder="Contoh: 123456789" 
                required 
                disabled={isLoading}
                value={id_pjlp}
                onChange={(e) => setIdPjlp(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                required 
                type="password" 
                placeholder="••••••••" 
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Memproses..." : "Login"}
            </Button>
            <div className="relative my-2">
                <Separator />
            </div>
            <div className="flex flex-col items-center space-y-2">
               <p className="px-8 text-center text-sm text-muted-foreground">
                 Belum punya akun?{" "}
                <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                    Daftar di sini
                </Link>
              </p>
              <Button variant="link" size="sm" asChild>
                <Link href="#">Lupa Password?</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
