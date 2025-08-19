
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 font-headline text-2xl">
            Periksa Email Anda
          </CardTitle>
          <CardDescription>
            Kami telah mengirimkan tautan verifikasi ke alamat email Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-muted-foreground">
            Silakan klik tautan di dalam email tersebut untuk menyelesaikan pendaftaran. Jika Anda tidak menerimanya, periksa folder spam Anda.
          </p>
           <p className="mb-6 text-xs text-muted-foreground">
            Setelah email diverifikasi, Anda dapat menutup tab ini dan kembali untuk login.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Kembali ke Halaman Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
