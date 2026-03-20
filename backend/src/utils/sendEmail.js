const nodemailer = require('nodemailer');

async function sendOtpEmail(email, otp) {
    // If SMTP details aren't configured yet, just log to console
    // This allows local testing without setting up real email
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('\n=============================================');
        console.log(`[EMAIL DEV MODE] OTP for ${email} is: ${otp}`);
        console.log('=============================================\n');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `"Campus Facility Portal" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Confidential Anonymity Code',
        text: `Your anonymous submission verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nYour identity remains 100% hidden. We will instantly discard your email address after you enter this code.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP emailed successfully to ${email}`);
    } catch (err) {
        console.error('Error sending email:', err);
        throw err;
    }
}

module.exports = sendOtpEmail;
