
"use client"

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { requestPasswordReset } from './actions';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(event.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result.success) {
      setSuccess(result.message || null);
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
          <CardTitle className="font-headline text-2xl">Lupa Password</CardTitle>
          <CardDescription>Masukkan email Anda. Kami akan mengirimkan tautan untuk mereset password Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
           {success && (
            <Alert variant="default" className="mb-4 border-green-500 text-green-700 dark:border-green-600 dark:text-green-400 [&>svg]:text-green-500 dark:[&>svg]:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Email Terkirim</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                placeholder="email@anda.com" 
                required 
                type="email"
                disabled={loading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Mengirim..." : "Kirim Email Reset"}
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
