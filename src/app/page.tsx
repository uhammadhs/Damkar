
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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      toast({
        title: "Login Gagal",
        description: "Username dan password harus diisi.",
        variant: "destructive",
      });
      return;
    }

    // Simulasi pengecekan peran (role)
    if (username.toLowerCase() === 'admin') {
      // Di aplikasi nyata, Anda akan memverifikasi password di sini
      toast({
        title: "Login Berhasil",
        description: "Selamat datang, Admin!",
      });
      router.push('/admin/dashboard');
    } else {
       // Di aplikasi nyata, Anda akan memverifikasi password di sini
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${username}!`,
      });
      router.push('/dashboard');
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
              <Label htmlFor="username">NIP / Username</Label>
              <Input id="username" name="username" placeholder="Masukkan NIP atau Username" required type="text" />
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
            <Button variant="link" size="sm" className="w-full" asChild>
              <Link href="#">Lupa Password?</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
