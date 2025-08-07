const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://gyrus-backend-admin.onrender.com//api/otp';

// Validate Indian phone number (10 digits, starting with 6-9)
const validatePhoneNumber = (phoneNumber) => {
  const cleanedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
  return /^[6-9]\d{9}$/.test(cleanedPhone);
};

// Format phone number to 10 digits
const formatPhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/\D/g, '').slice(-10); // Keep last 10 digits
};

export const sendOtp = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      throw new Error('Invalid phone number format. Must be a 10-digit Indian number starting with 6-9.');
    }
    const response = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone }) 
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send OTP: ${response.status}`);
    }
    return response;
  } catch (error) {
    throw new Error(`Error sending OTP: ${error.message}`);
  }
};

export const verifyOtp = async (phoneNumber, otp) => {
  try {
    if (!phoneNumber || !otp) {
      throw new Error('Phone number and OTP are required');
    }
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedPhone)) {
      throw new Error('Invalid phone number format. Must be a 10-digit Indian number starting with 6-9.');
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw new Error('OTP must be a 6-digit number');
    }
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formattedPhone, otp }) // Match backend's expected field name
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to verify OTP: ${response.status}`);
    }
    return response;
  } catch (error) {
    throw new Error(`Error verifying OTP: ${error.message}`);
  }
};