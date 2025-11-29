"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Check, AlertCircle } from "lucide-react";

interface Resident {
  _id: string;
  fullName: string;
  email: string;
  unitNumber: string;
  phoneNumber: string;
}

interface VisitorFormData {
  name: string;
  phone: string;
  purpose: string;
  residentId: string;
  unitNumber: string;
  vehicleNumber: string;
  idPhoto: string | null;
  otpVerified: boolean;
}

export default function ManualEntryForm() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showResidentSelector, setShowResidentSelector] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<VisitorFormData>({
    name: "",
    phone: "7055877416",
    purpose: "",
    residentId: "",
    unitNumber: "",
    vehicleNumber: "",
    idPhoto: null,
    otpVerified: true,
  });

  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );

  // Fetch residents on mount
  useEffect(() => {
    fetchResidents();
  }, []);

  // Filter residents based on search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResidents(residents);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = residents.filter(
        (resident) =>
          resident.fullName.toLowerCase().includes(query) ||
          resident.unitNumber.toLowerCase().includes(query) ||
          resident.phoneNumber.includes(query)
      );
      setFilteredResidents(filtered);
    }
  }, [searchQuery, residents]);

  // OTP resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await fetch("/api/guard/residents/list");
      const data = await response.json();

      if (data.success) {
        setResidents(data.data.residents || []);
        setFilteredResidents(data.data.residents || []);
      } else {
        setError("Failed to load residents");
      }
    } catch (err) {
      console.error("Failed to fetch residents:", err);
      setError("Failed to load residents");
    }
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setShowCamera(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Failed to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setFormData({ ...formData, idPhoto: imageData });
        stopCamera();
        setSuccess("ID photo captured successfully!");
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const retakePhoto = () => {
    setFormData({ ...formData, idPhoto: null });
  };

  const skipPhoto = () => {
    setFormData({ ...formData, idPhoto: "skipped" });
  };

  // Resident Selection
  const openResidentSelector = () => {
    setShowResidentSelector(true);
    setSearchQuery("");
  };

  const selectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({
      ...formData,
      residentId: resident._id,
      unitNumber: resident.unitNumber,
    });
    setShowResidentSelector(false);
    setSearchQuery("");
  };

  // OTP Functions
  const sendOTP = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visitor/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (data.success) {
        setShowOTPModal(true);
        setResendTimer(60);
        setSuccess("OTP sent successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to send OTP. Please check your network connection.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && index === 5) {
      verifyOTP(newOtp.join(""));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpValue: string) => {
    setOtpLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visitor/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp: otpValue }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ ...formData, otpVerified: true });
        setShowOTPModal(false);
        setSuccess("Phone number verified successfully!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Failed to verify OTP");
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    await sendOTP();
  };

  // Form Submission
  // Add this function at the top of your component, before handleSubmit
  const capitalizeWords = (str: string): string => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (
      !formData.name ||
      !formData.phone ||
      !formData.purpose ||
      !formData.residentId
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (!formData.otpVerified) {
      setError("Please verify phone number with OTP");
      return;
    }

    try {
      setLoading(true);

      const visitorData = {
        name: capitalizeWords(formData.name), // ← CHANGED
        phone: formData.phone,
        purpose: capitalizeWords(formData.purpose), // ← CHANGED
        hostResidentId: formData.residentId,
        vehicleNumber: formData.vehicleNumber || undefined,
        idCardImageUrl:
          formData.idPhoto && formData.idPhoto !== "skipped"
            ? formData.idPhoto
            : undefined,
        photoUrl:
          formData.idPhoto && formData.idPhoto !== "skipped"
            ? formData.idPhoto
            : undefined,
        isWalkIn: true,
        phoneVerified: true,
      };

      const response = await fetch("/api/guard/manual-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visitorData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Visitor entry created! Approval request sent to resident.");

        // Reset form
        setFormData({
          name: "",
          phone: "",
          purpose: "",
          residentId: "",
          unitNumber: "",
          vehicleNumber: "",
          idPhoto: null,
          otpVerified: false,
        });
        setSelectedResident(null);
        setOtp(["", "", "", "", "", ""]);

        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || "Failed to create visitor entry");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to create visitor entry");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Walk-in Visitor Entry
        </h2>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visitor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter visitor name"
              required
            />
          </div>

          {/* Phone Number with OTP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({
                    ...formData,
                    phone: value,
                    otpVerified: false,
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="10-digit phone number"
                maxLength={10}
                required
                disabled={formData.otpVerified}
              />
              {!formData.otpVerified ? (
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={formData.phone.length !== 10 || otpLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 whitespace-nowrap">
                  <Check className="w-5 h-5" />
                  Verified
                </div>
              )}
            </div>
          </div>

          {/* Whom to Meet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Whom to Meet <span className="text-red-500">*</span>
            </label>
            <div
              onClick={openResidentSelector}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-white"
            >
              {selectedResident ? (
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedResident.fullName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Unit {selectedResident.unitNumber} •{" "}
                    {selectedResident.phoneNumber}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Click to select resident</div>
              )}
            </div>
          </div>

          {/* Unit Number (Read-only) */}
          {formData.unitNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Number
              </label>
              <input
                type="text"
                value={formData.unitNumber}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          )}

          {/* Purpose of Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Visit <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Enter purpose of visit (e.g., Personal visit, Delivery, Business meeting)"
              required
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number (Optional)
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vehicleNumber: e.target.value.toUpperCase(),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., DL01AB1234"
            />
          </div>

          {/* ID Photo Capture - Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor ID Photo (Optional)
            </label>

            {!formData.idPhoto ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600"
                >
                  <Camera className="w-6 h-6" />
                  <span className="font-medium">Capture ID Photo</span>
                </button>
                <button
                  type="button"
                  onClick={skipPhoto}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Skip Photo (Continue without photo)
                </button>
              </div>
            ) : formData.idPhoto === "skipped" ? (
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Photo skipped - continuing without visitor photo
                </p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, idPhoto: null })}
                  className="text-sm text-purple-600 hover:text-purple-700 underline"
                >
                  Add Photo Instead
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                  <img
                    src={formData.idPhoto}
                    alt="Captured ID"
                    className="w-full h-auto"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Captured
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retake Photo
                  </button>
                  <button
                    type="button"
                    onClick={skipPhoto}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? "Sending Request..." : "Send Approval Request"}
          </button>
        </form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Capture ID Photo
              </h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </button>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Resident Selector Modal */}
      {showResidentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Select Resident
              </h3>
              <button
                onClick={() => setShowResidentSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, unit, or phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredResidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No residents found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResidents.map((resident) => (
                    <button
                      key={resident._id}
                      type="button"
                      onClick={() => selectResident(resident)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">
                        {resident.fullName}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Unit {resident.unitNumber}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {resident.phoneNumber} • {resident.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Verify OTP</h3>
              <button
                onClick={() => setShowOTPModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit OTP sent to <strong>{formData.phone}</strong>
            </p>

            <div className="flex justify-center space-x-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ))}
            </div>

            {resendTimer > 0 ? (
              <p className="text-center text-sm text-gray-500">
                Resend OTP in <strong>{resendTimer}s</strong>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
