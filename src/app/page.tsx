
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
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Email dan password harus diisi.");
      setIsLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || "Email atau password salah. Periksa kembali.");
      setIsLoading(false);
      return;
    }
    
    // Fetch profile with a more robust method
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id);
    
    if (profileError) {
       setError(`Gagal memuat data profil. Silakan hubungi admin. (Error: ${profileError.message})`);
       await supabase.auth.signOut(); // Log out user if profile is inaccessible
       setIsLoading(false);
       return;
    }

    if (!profiles || profiles.length === 0) {
        setError("Profil pengguna tidak ditemukan. Silakan hubungi admin untuk mendaftarkan profil Anda.");
        await supabase.auth.signOut(); // Log out user if profile doesn't exist
        setIsLoading(false);
        return;
    }
    
    // If multiple profiles are found, take the first one and log a warning.
    if (profiles.length > 1) {
        console.warn(`Peringatan: Ditemukan ${profiles.length} profil untuk pengguna ID ${authData.user.id}. Menggunakan profil pertama.`);
    }

    const profile = profiles[0];

    if (profile.role === 'admin') {
      toast({
        title: "Login Berhasil",
        description: "Selamat datang, Admin!",
      });
      router.push('/admin/dashboard');
    } else {
      toast({
        title: "Login Berhasil",
        description: `Selamat datang!`,
      });
      router.push('/dashboard');
    }
    
    router.refresh();
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
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="contoh@email.com" required type="email" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" placeholder="••••••••" disabled={isLoading} />
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
