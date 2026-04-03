const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env" });

async function testEmail() {
    console.log("Using user:", process.env.SMTP_USER);
    // Don't log full password for security, just length
    console.log("Using password (length):", process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0);
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        console.log("Testing connection...");
        await transporter.verify();
        console.log("Connection verified!");
        
        console.log("Attempting to send a test email...");
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: "Test Email",
            text: "This is a test email.",
        });
        console.log("Email sent! Message ID:", info.messageId);
    } catch (error) {
        console.error("Email test failed:", error);
    }
}

testEmail();
