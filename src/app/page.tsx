
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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast({
        title: "Login Gagal",
        description: "Email dan password harus diisi.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
       toast({
        title: "Login Gagal",
        description: error?.message || "Email atau password salah.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for user role from profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
    
    if (profileError || !profile) {
        // If profile doesn't exist, log them out and show error.
        // The profile should be created by a trigger. If not, something is wrong.
        toast({
            title: "Login Gagal",
            description: "Tidak dapat menemukan data profil pengguna. Silakan hubungi admin.",
            variant: "destructive"
        });
        await supabase.auth.signOut();
        return;
    }


    if (profile.role === 'admin') {
      toast({
        title: "Login Berhasil",
        description: "Selamat datang, Admin!",
      });
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      toast({
        title: "Login Berhasil",
        description: `Selamat datang!`,
      });
      router.push('/dashboard');
      router.refresh();
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
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="contoh@email.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" placeholder="••••••••" />
            </div>
            <Button className="w-full" type="submit">
              Login
            </Button>
            <div className="relative my-2">
                <Separator />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Button variant="link" size="sm" asChild>
                <Link href="#">Lupa Password?</Link>
              </Button>
              <p className="px-8 text-center text-xs text-muted-foreground">
                 Pengguna pertama? Buat akun via Supabase dashboard lalu ubah `role` menjadi `admin` di tabel `profiles`.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
