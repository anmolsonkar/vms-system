const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_EXPIRY_MINUTES);
  return expiry;
}

export function verifyOTP(inputOTP: string, storedOTP: string, expiryDate: Date): boolean {
  // Check if OTP has expired
  if (new Date() > expiryDate) {
    return false;
  }

  // Check if OTP matches
  return inputOTP === storedOTP;
}

export function maskPhoneNumber(phone: string): string {
  if (phone.length < 4) return phone;
  const last4 = phone.slice(-4);
  const masked = '*'.repeat(phone.length - 4);
  return masked + last4;
}