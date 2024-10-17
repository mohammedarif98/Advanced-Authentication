import nodemailer from 'nodemailer'


export async function sendEmail(options){
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"AUTH-PRO" <arifcs532@gmail.com>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    }
    await transporter.sendMail(mailOptions) 
}