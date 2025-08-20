
"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { updatePassword } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
    )
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(updatePassword, { success: false });

  React.useEffect(() => {
    if (state.success) {
      // Redirect to login page with a success message
      router.push(`/?message=${encodeURIComponent(state.message || 'Password berhasil diubah. Silakan login.')}`);
    }
  }, [state, router]);

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
          {state?.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" action={formAction}>
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input 
                id="password" 
                name="password" 
                placeholder="••••••••" 
                required 
                type="password"
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
              />
            </div>
            <SubmitButton />
            <Button variant="link" asChild className="w-full">
                <Link href="/">Kembali ke Login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
