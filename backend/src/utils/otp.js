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
  // MySQL DATETIME format
  return expiry.toISOString().slice(0, 19).replace('T', ' ');
}

module.exports = { generateOtp, getOtpExpiry };
