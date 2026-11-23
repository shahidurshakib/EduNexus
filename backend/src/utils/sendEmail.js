const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error('❌ Nodemailer transport error:', err.message);
    console.error('   Check EMAIL_USER / EMAIL_PASS (must be a Gmail App Password) in .env');
  } else {
    console.log('✅ Nodemailer ready to send email via', process.env.EMAIL_USER);
  }
});

async function sendOtpEmail(to, fullName, otp, purpose = 'registration') {
  const subject =
    purpose === 'password_reset'
      ? 'EduNexus — Password Reset Code'
      : 'EduNexus — Verify Your Email';

  const heading =
    purpose === 'password_reset' ? 'Reset your password' : 'Verify your email';

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background:#F8FAFC;">
    <h2 style="color:#0F172A;">${heading}</h2>
    <p style="color:#334155;">Hi ${fullName || 'there'},</p>
    <p style="color:#334155;">
      ${
        purpose === 'password_reset'
          ? 'Use the code below to reset your EduNexus password.'
          : 'Use the code below to verify your EduNexus account.'
      }
    </p>
    <div style="background:#2563EB; color:#fff; font-size:28px; letter-spacing:8px; font-weight:bold; text-align:center; padding:16px; border-radius:12px; margin:24px 0;">
      ${otp}
    </div>
    <p style="color:#64748B; font-size:13px;">
      This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. If you didn't request this, you can ignore this email.
    </p>
    <p style="color:#94A3B8; font-size:12px; margin-top:32px;">EduNexus — A Smart University Research & Startup Innovation Ecosystem</p>
  </div>`;

  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'EduNexus'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail, transporter };
