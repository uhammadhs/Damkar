
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AjukanCutiPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Here you would typically handle form submission, e.g., send data to an API.
        
        toast({
            title: "Pengajuan Terkirim",
            description: "Pengajuan cuti Anda telah berhasil dikirim dan sedang menunggu persetujuan.",
        });

        router.push("/dashboard");
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFileName(event.target.files[0].name);
        } else {
            setFileName(null);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="font-headline">Formulir Pengajuan Cuti</CardTitle>
                    <CardDescription>
                        Isi formulir di bawah ini untuk mengajukan cuti. Pastikan semua data sudah benar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="leave-dates">Tanggal Cuti</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="leave-dates"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pilih rentang tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Judul Pengajuan</Label>
                        <Input id="title" placeholder="Contoh: Izin Sakit, Cuti Tahunan" required />
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="reason">Alasan Cuti</Label>
                        <Textarea id="reason" placeholder="Jelaskan alasan Anda mengajukan cuti..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="attachment">Lampiran (Opsional)</Label>
                         <Input 
                            id="attachment" 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2" />
                            {fileName || "Unggah Dokumen Pendukung"}
                        </Button>
                         <p className="text-xs text-muted-foreground">
                            Contoh: surat dokter untuk cuti sakit, surat undangan untuk izin, dll.
                         </p>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
                    <Button type="submit">Kirim Pengajuan</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
