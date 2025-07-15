import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProfilPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Profil Anggota</CardTitle>
        <CardDescription>
          Informasi pribadi dan pengaturan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Halaman profil sedang dalam pengembangan.</p>
      </CardContent>
    </Card>
  );
}
