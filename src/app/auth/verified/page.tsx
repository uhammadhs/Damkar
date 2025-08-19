
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function VerifiedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
            <CheckCircle className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 font-headline text-2xl">
            Akun Berhasil Dibuat
          </CardTitle>
          <CardDescription>
            Selamat! Akun Anda telah berhasil dibuat dan aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Anda sekarang dapat login ke aplikasi menggunakan ID PJLP dan password yang telah Anda daftarkan.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Lanjut ke Halaman Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
