
"use client"

import Link from 'next/link';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { login, type LoginState } from './actions';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Memproses..." : "Login"}
        </Button>
    )
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error');
  
  const initialState: LoginState = { error: initialError, message: searchParams.get('message') };
  const [state, formAction] = useActionState(login, initialState);

  return (
    <Card className="z-10 w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">SIAP CUTI</CardTitle>
        <CardDescription>Sistem Izin Siaga dan Berhalangan</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Gagal</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
         {state?.message && (
          <Alert variant="default" className="mb-4 border-green-500 text-green-700 dark:border-green-600 dark:text-green-400 [&>svg]:text-green-500 dark:[&>svg]:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Sukses</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <form className="space-y-4" action={formAction}>
          <div className="space-y-2">
            <Label htmlFor="id_pjlp">ID PJLP</Label>
            <Input 
              id="id_pjlp" 
              name="id_pjlp" 
              placeholder="Contoh: 123456789" 
              required 
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
            />
          </div>
          <LoginButton />
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
              <Link href="/forgot-password">Lupa Password?</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
