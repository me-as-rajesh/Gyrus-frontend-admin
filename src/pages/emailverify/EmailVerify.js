// EmailVerify.js (updated)
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOTP } from "../../services/mongoDbService"; // Assuming path
import styles from "./EmailVerify.module.css";

export default function EmailVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  const email = location.state?.email; // From Signin.js

  useEffect(() => {
    if (!email) {
      navigate("/signin"); // Redirect if no email
    }

    inputRefs.current = inputRefs.current.slice(0, 6);

    // Resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev > 1) return prev - 1;
        setCanResend(true);
        clearInterval(timer);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Prevent multi-char input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    setError("");
    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyOTP(email, otpCode);
      if (isValid) {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(60);
    // Re-call login API to resend OTP (assuming password not needed for resend; add backend /resend-otp)
    try {
      await fetch(`https://gyrus-backend-admin.onrender.com/api/teachers/resend-otp`, { // Add this endpoint in backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Success: Restart timer
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Verify Your Email</h2>
      <p>Please enter the 6-digit OTP sent to {email}.</p>

      <div className={styles.otpInputGroup}>
        {otp.map((digit, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            className={styles.otpInput}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            ref={(el) => (inputRefs.current[i] = el)}
          />
        ))}
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <button
        className={styles.verifyBtn}
        onClick={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </button>

      <p>
        Didn't receive OTP?{" "}
        <button
          onClick={handleResend}
          disabled={!canResend}
          className={canResend ? "text-blue-500" : "text-gray-500"}
        >
          Resend {resendTimer > 0 ? `in ${resendTimer}s` : ""}
        </button>
      </p>
    </div>
  );
}