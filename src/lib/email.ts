
'use server'

import { Resend } from 'resend';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { resendApiKey, resendFromEmail } from './config';

interface LeaveStatusEmailProps {
    to: string;
    name: string;
    status: 'Disetujui' | 'Ditolak';
    requestTitle: string;
    startDate: string;
    endDate: string;
}

export async function sendLeaveStatusEmail({ to, name, status, requestTitle, startDate, endDate }: LeaveStatusEmailProps) {

    if (!resendApiKey) {
        console.error("Resend API Key is missing. Email will not be sent.");
        throw new Error("Konfigurasi email server tidak lengkap (API Key tidak ditemukan).");
    }
    if (!resendFromEmail) {
        console.error("Resend 'From' email is missing. Email will not be sent.");
        throw new Error("Konfigurasi email server tidak lengkap (Alamat email pengirim tidak ditemukan).");
    }

    const resend = new Resend(resendApiKey);
    
    const subject = `Pembaruan Status Pengajuan Cuti: ${requestTitle}`;
    const statusText = status === 'Disetujui' ? 'telah disetujui' : 'ditolak';
    const formattedStartDate = format(new Date(startDate), "EEEE, d MMMM yyyy", { locale: id });
    const formattedEndDate = format(new Date(endDate), "EEEE, d MMMM yyyy", { locale: id });

    const { data, error } = await resend.emails.send({
        from: `SIAP CUTI <${resendFromEmail}>`,
        to: [to],
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Pembaruan Status Pengajuan Cuti</h2>
                <p>Yth. ${name},</p>
                <p>Kami memberitahukan bahwa pengajuan cuti Anda dengan detail sebagai berikut <strong>${statusText}</strong> oleh admin.</p>
                <hr>
                <p><strong>Judul Pengajuan:</strong> ${requestTitle}</p>
                <p><strong>Tanggal:</strong> ${formattedStartDate} - ${formattedEndDate}</p>
                <p><strong>Status Saat Ini:</strong> ${status}</p>
                <hr>
                <p>Anda dapat melihat detail lebih lanjut dengan login ke aplikasi SIAP CUTI.</p>
                <p>Terima kasih.</p>
                <br>
                <p><em>Ini adalah email otomatis, mohon untuk tidak membalas.</em></p>
            </div>
        `,
    });

    if (error) {
        console.error("Resend API Error:", error);
        throw new Error(`Gagal mengirim email: ${error.message}`);
    }

    return data;
}
