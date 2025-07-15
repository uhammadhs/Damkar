import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0 opacity-20"
        data-ai-hint="command center"
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="z-10 w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">ADMIN SIAP CUTI</CardTitle>
          <CardDescription>Sistem Izin Siaga dan Berhalangan</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username Admin</Label>
              <Input id="username" placeholder="Masukkan username" required type="text" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" required type="password" placeholder="••••••••" />
            </div>
            <Button asChild className="w-full" type="submit">
              <Link href="/admin/dashboard">Login Admin</Link>
            </Button>
            <Button variant="link" size="sm" className="w-full" asChild>
                <Link href="/">Login Anggota</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
