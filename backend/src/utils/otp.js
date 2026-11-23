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
  // Build the DATETIME string from LOCAL time components (not .toISOString(),
  // which converts to UTC). MySQL's DATETIME column has no timezone of its
  // own, and this string gets re-parsed later with `new Date(expires_at)` —
  // which JS interprets as LOCAL time. Using toISOString() here silently
  // shifted every expiry by the server's UTC offset (e.g. ~6 hours for
  // Bangladesh), making OTPs look "expired" within minutes of being sent.
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${expiry.getFullYear()}-${pad(expiry.getMonth() + 1)}-${pad(expiry.getDate())} ` +
    `${pad(expiry.getHours())}:${pad(expiry.getMinutes())}:${pad(expiry.getSeconds())}`
  );
}

module.exports = { generateOtp, getOtpExpiry };
