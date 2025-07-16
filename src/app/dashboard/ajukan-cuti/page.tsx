
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Upload } from "lucide-react"
import { format, parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"
import { id } from 'date-fns/locale'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitLeaveRequest } from "./actions"

// We assume this data will be fetched from the DB
// For now, we use a client-side fetch in a useEffect
type LeaveType = {
    id: number;
    name: string;
};

export default function AjukanCutiPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);
    const [leaveTypes, setLeaveTypes] = React.useState<LeaveType[]>([]);
    const formRef = React.useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        // In a real app, you would fetch this from your server component
        // but for simplicity, we'll keep it static for now
        // This should be fetched in the main server component and passed as a prop
        const fetchLeaveTypes = async () => {
             // This is a placeholder. In a real scenario, this data would come from a server component fetch.
            const types = [
                { id: 1, name: 'Cuti Tahunan' },
                { id: 2, name: 'Cuti Sakit' },
                { id: 3, name: 'Cuti Alasan Penting' },
                { id: 4, name: 'Cuti Melahirkan' },
                { id: 5, name: 'Cuti Besar' },
            ];
            setLeaveTypes(types);
        };
        fetchLeaveTypes();
    }, []);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        if (date?.from) formData.set('start_date', format(date.from, 'yyyy-MM-dd'));
        if (date?.to) formData.set('end_date', format(date.to, 'yyyy-MM-dd'));

        const result = await submitLeaveRequest(formData);

        if (result.success) {
            toast({
                title: "Pengajuan Terkirim",
                description: result.message,
            });
            router.push("/dashboard/riwayat");
        } else {
             toast({
                title: "Pengajuan Gagal",
                description: result.message,
                variant: "destructive",
            });
        }
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
            <form ref={formRef} onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="font-headline">Formulir Pengajuan Cuti</CardTitle>
                    <CardDescription>
                        Isi formulir di bawah ini untuk mengajukan cuti. Pastikan semua data sudah benar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                         <Label htmlFor="leave_type_id">Jenis Cuti</Label>
                         <Select name="leave_type_id" required>
                             <SelectTrigger id="leave_type_id">
                                <SelectValue placeholder="Pilih jenis cuti..." />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveTypes.map((type) => (
                                    <SelectItem key={type.id} value={String(type.id)}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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
                                                {format(date.from, "d LLL, y", { locale: id })} -{" "}
                                                {format(date.to, "d LLL, y", { locale: id })}
                                            </>
                                        ) : (
                                            format(date.from, "d LLL, y", { locale: id })
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
                        <Input name="title" id="title" placeholder="Contoh: Izin Sakit, Cuti Tahunan" required />
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="reason">Alasan Cuti</Label>
                        <Textarea name="reason" id="reason" placeholder="Jelaskan alasan Anda mengajukan cuti..." required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="attachment">Lampiran (Opsional)</Label>
                         <Input 
                            id="attachment" 
                            name="attachment"
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
