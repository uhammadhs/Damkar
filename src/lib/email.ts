
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
    
    const subject = status === 'Disetujui'
        ? `Selamat! Pengajuan Cuti Anda Disetujui: "${requestTitle}"`
        : `Informasi Pengajuan Cuti Ditolak: "${requestTitle}"`;
    
    const statusText = status === 'Disetujui' ? 'telah disetujui' : 'ditolak';
    const introText = status === 'Disetujui'
        ? `Kami dengan gembira memberitahukan bahwa pengajuan cuti Anda telah disetujui oleh admin.`
        : `Dengan berat hati kami memberitahukan bahwa pengajuan cuti Anda belum dapat disetujui oleh admin.`;

    const formattedStartDate = format(new Date(startDate), "EEEE, d MMMM yyyy", { locale: id });
    const formattedEndDate = format(new Date(endDate), "EEEE, d MMMM yyyy", { locale: id });

    const { data, error } = await resend.emails.send({
        from: `SIAP CUTI Admin <${resendFromEmail}>`,
        to: [to],
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D32F2F;">Pembaruan Status Pengajuan Cuti</h2>
                <p>Yth. ${name},</p>
                <p>${introText}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="margin-bottom: 5px;"><strong>Judul Pengajuan:</strong> ${requestTitle}</p>
                <p style="margin-bottom: 5px;"><strong>Tanggal:</strong> ${formattedStartDate} - ${formattedEndDate}</p>
                <p style="margin-bottom: 5px;"><strong>Status Saat Ini:</strong> <strong style="color: ${status === 'Disetujui' ? '#28a745' : '#dc3545'};">${status}</strong></p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p>Anda dapat melihat detail lebih lanjut dengan login ke aplikasi SIAP CUTI.</p>
                <p>Terima kasih atas perhatiannya.</p>
                <br>
                <p style="font-size: 0.8em; color: #777;"><em>Ini adalah email otomatis, mohon untuk tidak membalas.</em></p>
            </div>
        `,
    });

    if (error) {
        console.error("Resend API Error:", error);
        throw new Error(`Gagal mengirim email: ${error.message}`);
    }

    return data;
}
