
'use server'

import { Resend } from 'resend';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LeaveStatusEmailProps {
    to: string;
    name: string;
    status: 'Disetujui' | 'Ditolak';
    requestTitle: string;
    startDate: string;
    endDate: string;
}

export async function sendLeaveStatusEmail({ to, name, status, requestTitle, startDate, endDate }: LeaveStatusEmailProps) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

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
        from: `CUTI DAMKAR Admin <${resendFromEmail}>`,
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
                <p>Anda dapat melihat detail lebih lanjut dengan login ke aplikasi CUTI DAMKAR.</p>
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

interface NewUserWelcomeEmailProps {
    to: string;
    name: string;
    id_pjlp: string;
    password: string;
    loginUrl: string;
}

export async function sendNewUserWelcomeEmail({ to, name, id_pjlp, password, loginUrl }: NewUserWelcomeEmailProps) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !resendFromEmail) {
        console.error("Konfigurasi email tidak lengkap untuk email selamat datang.");
        throw new Error("Konfigurasi email server tidak lengkap.");
    }
    
    const resend = new Resend(resendApiKey);

    const subject = "Selamat Datang di CUTI DAMKAR!";
    
    const { data, error } = await resend.emails.send({
        from: `CUTI DAMKAR Admin <${resendFromEmail}>`,
        to: [to],
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D32F2F;">Selamat Bergabung, ${name}!</h2>
                <p>Akun Anda untuk aplikasi CUTI DAMKAR telah berhasil dibuat oleh admin.</p>
                <p>Anda dapat menggunakan detail berikut untuk login ke dalam sistem:</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="margin-bottom: 5px;"><strong>ID PJLP:</strong> ${id_pjlp}</p>
                <p style="margin-bottom: 5px;"><strong>Password Sementara:</strong> ${password}</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p>Silakan klik tombol di bawah ini untuk langsung menuju halaman login.</p>
                <a href="${loginUrl}" style="background-color: #D32F2F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login ke CUTI DAMKAR</a>
                <p>Untuk keamanan, kami sangat menyarankan Anda untuk segera mengubah password setelah berhasil login pertama kali melalui halaman profil Anda.</p>
                <br>
                <p style="font-size: 0.8em; color: #777;"><em>Ini adalah email otomatis, mohon untuk tidak membalas.</em></p>
            </div>
        `,
    });

     if (error) {
        console.error("Resend API Error (Welcome Email):", error);
        throw new Error(`Gagal mengirim email selamat datang: ${error.message}`);
    }

    return data;
}
