
import { Resend } from 'resend';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable.");
}
if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("Missing RESEND_FROM_EMAIL environment variable. This should be a verified domain in Resend.");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL;

interface LeaveStatusEmailProps {
    to: string;
    name: string;
    status: 'Disetujui' | 'Ditolak';
    requestTitle: string;
    startDate: string;
    endDate: string;
}

export async function sendLeaveStatusEmail({ to, name, status, requestTitle, startDate, endDate }: LeaveStatusEmailProps) {

    const subject = `Pembaruan Status Pengajuan Cuti: ${requestTitle}`;
    const statusText = status === 'Disetujui' ? 'telah disetujui' : 'ditolak';
    const formattedStartDate = format(new Date(startDate), "EEEE, d MMMM yyyy", { locale: id });
    const formattedEndDate = format(new Date(endDate), "EEEE, d MMMM yyyy", { locale: id });

    const { data, error } = await resend.emails.send({
        from: `SIAP CUTI <${fromEmail}>`,
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
        throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
}
