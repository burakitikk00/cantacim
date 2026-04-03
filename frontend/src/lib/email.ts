import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "L'ELITE";

    await transporter.sendMail({
        from: `"${appName}" <${process.env.SMTP_USER || "noreply@example.com"}>`,
        to,
        subject,
        html,
    });
}

export function getPasswordResetEmailHtml(resetUrl: string) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "L'ELITE";
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="background:#1a1a1a;padding:32px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:2px;">${appName}</h1>
            </div>
            <div style="padding:32px;">
                <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:20px;">Şifre Sıfırlama</h2>
                <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
                    Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz.
                </p>
                <a href="${resetUrl}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:14px;letter-spacing:1px;">
                    ŞİFREMİ SIFIRLA
                </a>
                <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:24px 0 0;">
                    Bu link 1 saat içinde geçerliliğini yitirecektir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                </p>
                <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;"/>
                <p style="color:#d1d5db;font-size:11px;margin:0;">
                    Bu link çalışmazsa aşağıdaki URL'yi tarayıcınıza yapıştırın:<br/>
                    <span style="color:#6b7280;word-break:break-all;">${resetUrl}</span>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function getVerificationEmailHtml(verifyUrl: string) {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "L'ELITE";
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <div style="background:#1a1a1a;padding:32px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:2px;">${appName}</h1>
            </div>
            <div style="padding:32px;">
                <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:20px;">Hoş Geldiniz!</h2>
                <p style="color:#6b7280;line-height:1.6;margin:0 0 24px;">
                    Hesabınızı oluşturduğunuz için teşekkür ederiz. Hizmetlerimizden tam yararlanabilmek için lütfen e-posta adresinizi doğrulayın.
                </p>
                <a href="${verifyUrl}" style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:bold;font-size:14px;letter-spacing:1px;">
                    E-POSTAMI DOĞRULA
                </a>
                <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:24px 0 0;">
                    Bu link 24 saat içinde geçerliliğini yitirecektir. Hesabınızı doğrulamadan alışverişe devam edemeyebilirsiniz.
                </p>
                <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;"/>
                <p style="color:#d1d5db;font-size:11px;margin:0;">
                    Bu link çalışmazsa aşağıdaki URL'yi tarayıcınıza yapıştırın:<br/>
                    <span style="color:#6b7280;word-break:break-all;">${verifyUrl}</span>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}
