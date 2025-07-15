import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RiwayatPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Riwayat Cuti</CardTitle>
        <CardDescription>
          Di sini Anda dapat melihat semua riwayat pengajuan cuti Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Fitur riwayat cuti sedang dalam pengembangan.</p>
      </CardContent>
    </Card>
  );
}
