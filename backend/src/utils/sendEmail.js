
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(to, fullName, otp, purpose = 'registration') {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const subject =
    purpose === 'password_reset'
      ? 'EduNexus - Password Reset Code'
      : 'EduNexus - Verify Your Email';

  const heading =
    purpose === 'password_reset'
      ? 'Reset your password'
      : 'Verify your email';

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
        This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.
        If you didn't request this, you can ignore this email.
      </p>
      <p style="color:#94A3B8; font-size:12px; margin-top:32px;">
        EduNexus - A Smart University Research & Startup Innovation Ecosystem
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'EduNexus <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  console.log('OTP email sent successfully:', data?.id);
  return data;
}

module.exports = { sendOtpEmail };
