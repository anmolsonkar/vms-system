"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "../shared/Button";
import { CheckCircle, RefreshCw } from "lucide-react";
import axios from "axios";

interface OTPVerificationProps {
  phone: string;
  onVerified: () => void;
}

export default function OTPVerification({
  phone,
  onVerified,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input
    inputRefs.current[0]?.focus();

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all filled
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      verifyOTP(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpValue: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/visitor/verify-otp", {
        phone,
        otp: otpValue,
      });

      if (response.data.success) {
        onVerified();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("/api/visitor/send-otp", { phone });
      setResendTimer(60);
      setError("");
      alert("OTP resent successfully!");
    } catch (error) {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Your Phone Number
        </h3>
        <p className="text-sm text-gray-600">
          Enter the 6-digit OTP sent to <strong>{phone}</strong>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {/* Resend OTP */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Resend OTP in <strong>{resendTimer}s</strong>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <RefreshCw className="h-4 w-4 inline mr-1" />
            Resend OTP
          </button>
        )}
      </div>

      {/* Verify Button (manual) */}
      <Button
        onClick={() => verifyOTP(otp.join(""))}
        disabled={otp.some((digit) => digit === "") || loading}
        loading={loading}
        fullWidth
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Verify OTP
      </Button>
    </div>
  );
}
