import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../services/otpService';
import styles from './OtpInput.module.css';

const OtpInput = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendOtp(phoneNumber);
      if (response.ok) {
        setShowOtpInput(true);
        setError('');
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      setError('Error sending OTP');
    }
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    setOtp(prev => {
      const newOtp = prev.split('');
      newOtp[index] = value;
      return newOtp.join('');
    });
    if (value && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyUp = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await verifyOtp(phoneNumber, otp);
      if (response.ok) {
        setError('');
        navigate('/dashboard');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await sendOtp(phoneNumber);
      if (response.ok) {
        setError('');
        alert('OTP resent successfully');
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError('Error resending OTP');
    }
  };

  return (
    <div className={styles.container}>
      {!showOtpInput ? (
        <div className={styles.phoneInputContainer}>
          <h1>Phone Number Verification</h1>
          <p>Please enter your phone number to receive OTP</p>
          <form onSubmit={handlePhoneSubmit}>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={styles.phoneInput}
              placeholder="Enter phone number"
              required
            />
            <button type="submit" className={styles.submitButton}>Send OTP</button>
          </form>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      ) : (
        <>
          <h1>OTP Verification</h1>
          <p>Please enter the verification code sent to your mobile device.</p>
          <div className={styles.otpInputContainer}>
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className={styles.otpInput}
                ref={el => (inputRefs.current[index] = el)}
                onChange={(e) => handleInputChange(e, index)}
                onKeyUp={(e) => handleKeyUp(e, index)}
              />
            ))}
          </div>
          <button className={styles.verifyButton} onClick={handleVerifyOtp}>Verify OTP</button>
          <div className={styles.resendOtp}>
            Didn't receive the OTP? <button type="button" className={styles.resendOtpLink} onClick={handleResendOtp}>Resend OTP</button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </>
      )}
    </div>
  );
};

export default OtpInput;