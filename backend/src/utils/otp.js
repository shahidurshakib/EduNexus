
function generateOtp(length = Number(process.env.OTP_LENGTH) || 6) {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
}

function getOtpExpiry(minutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10) {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);

  // Build MySQL DATETIME using local time components.
  // Avoid toISOString() because it converts local time to UTC.
  const pad = (n) => String(n).padStart(2, '0');

  return (
    `${expiry.getFullYear()}-${pad(expiry.getMonth() + 1)}-${pad(expiry.getDate())} ` +
    `${pad(expiry.getHours())}:${pad(expiry.getMinutes())}:${pad(expiry.getSeconds())}`
  );
}

module.exports = { generateOtp, getOtpExpiry };
