
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Calendar as CalendarIcon, Upload, Loader2 } from "lucide-react"
import { format } from "date-fns"
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
import { submitLeaveRequest, type FormState } from "./actions"

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Mengirim..." : "Kirim Pengajuan"}
        </Button>
    )
}

export default function AjukanCutiPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    const initialState: FormState = { success: false, message: "" };
    const [state, formAction] = useActionState(submitLeaveRequest, initialState);

    React.useEffect(() => {
        if (state.success) {
            toast({
                title: "Pengajuan Terkirim",
                description: state.message,
            });
            router.push("/dashboard/riwayat");
        } else if (state.message && !state.errors) {
            // Show general errors (like insufficient leave) in a toast
            toast({
                title: "Pengajuan Gagal",
                description: state.message,
                variant: "destructive",
            });
        }
    }, [state, router, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFileName(event.target.files[0].name);
        } else {
            setFileName(null);
        }
    };

    const dateError = state.errors?.start_date?.[0] || state.errors?.end_date?.[0];

    return (
        <Card>
            <form ref={formRef} action={formAction}>
                 {/* Hidden inputs to pass date range to server action */}
                <input type="hidden" name="start_date" value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''} />
                <input type="hidden" name="end_date" value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''} />

                <CardHeader>
                    <CardTitle className="font-headline">Formulir Pengajuan Cuti</CardTitle>
                    <CardDescription>
                        Isi formulir di bawah ini untuk mengajukan cuti. Pastikan semua data sudah benar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="leave-dates" className={cn(dateError && "text-destructive")}>Tanggal Cuti</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="leave-dates"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground",
                                        dateError && "border-destructive text-destructive"
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
                                    disabled={{ before: new Date() }}
                                />
                            </PopoverContent>
                        </Popover>
                         {dateError && <p className="text-sm font-medium text-destructive">{dateError}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className={cn(state.errors?.title && "text-destructive")}>Judul Pengajuan</Label>
                        <Input name="title" id="title" placeholder="Contoh: Cuti Tahunan Keluarga" required className={cn(state.errors?.title && "border-destructive")} />
                        {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
                    </div>
                   
                    <div className="space-y-2">
                        <Label htmlFor="reason" className={cn(state.errors?.reason && "text-destructive")}>Alasan Cuti</Label>
                        <Textarea name="reason" id="reason" placeholder="Jelaskan alasan Anda mengajukan cuti..." required className={cn(state.errors?.reason && "border-destructive")} />
                        {state.errors?.reason && <p className="text-sm font-medium text-destructive">{state.errors.reason[0]}</p>}
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
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    )
}
