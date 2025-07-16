
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
import { registerUser } from './actions';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await registerUser(formData);

    if (result.success) {
      toast({
        title: "Pendaftaran Berhasil",
        description: "Silakan periksa email Anda untuk verifikasi akun sebelum login.",
        duration: 8000,
      });
      router.push('/');
    } else {
      toast({
        title: "Pendaftaran Gagal",
        description: result.message,
        variant: "destructive",
      });
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
          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Contoh: Budi Sanjaya" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="nip">NIP (Nomor Induk Pegawai)</Label>
              <Input id="nip" name="nip" placeholder="Contoh: 199505052020121005" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="pangkat">Pangkat / Golongan</Label>
              <Input id="pangkat" name="pangkat" placeholder="Contoh: Analis Kebakaran Ahli Pertama" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" placeholder="contoh@email.com" required type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" required type="password" placeholder="Minimal 6 karakter" />
            </div>
            <Button className="w-full" type="submit">
              Daftar
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
