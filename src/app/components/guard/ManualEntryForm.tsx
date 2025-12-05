"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Check, AlertCircle, Upload } from "lucide-react";

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
  const [cameraReady, setCameraReady] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<VisitorFormData>({
    name: "",
    phone: "",
    purpose: "",
    residentId: "",
    unitNumber: "",
    vehicleNumber: "",
    idPhoto: null,
    otpVerified: false,
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

  // Camera Functions - REAR CAMERA
  const startCamera = async () => {
    try {
      setCameraReady(false);
      setShowCamera(true);

      // Small delay to ensure modal is rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // ✅ Rear camera (back camera)
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);

        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log("✅ Camera started successfully");
                setCameraReady(true);
              })
              .catch((err) => {
                console.error("❌ Video play error:", err);
                setError("Failed to start camera preview");
                stopCamera();
              });
          }
        };

        // Fallback: Set ready after 2 seconds if metadata doesn't load
        setTimeout(() => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            setCameraReady(true);
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error("❌ Camera error:", err);

      let errorMessage = "Failed to access camera.";
      if (err.name === "NotAllowedError") {
        errorMessage =
          "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No camera found on this device.";
      } else if (err.name === "NotReadableError") {
        errorMessage = "Camera is already in use by another application.";
      }

      setError(errorMessage);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera not ready. Please try again.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is ready
    if (!cameraReady || video.readyState < 2) {
      setError("Camera is still loading. Please wait a moment.");
      return;
    }

    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      console.log(`📸 Capturing photo: ${canvas.width}x${canvas.height}`);

      const context = canvas.getContext("2d");

      if (context && canvas.width > 0 && canvas.height > 0) {
        // ✅ No mirror effect for rear camera - direct draw
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL("image/jpeg", 0.8);

        if (imageData && imageData.length > 100) {
          setFormData({ ...formData, idPhoto: imageData });
          stopCamera();
          setSuccess("Photo captured successfully!");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError("Failed to capture photo. Please try again.");
        }
      } else {
        setError("Camera dimensions not valid. Please try again.");
      }
    } catch (err) {
      console.error("❌ Capture error:", err);
      setError("Failed to capture photo. Please try again.");
    }
  };

  const retakePhoto = () => {
    setFormData({ ...formData, idPhoto: null });
  };

  const skipPhoto = () => {
    setFormData({ ...formData, idPhoto: "skipped" });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, idPhoto: reader.result as string });
        setSuccess("Photo uploaded successfully!");
        setTimeout(() => setSuccess(null), 3000);
      };
      reader.readAsDataURL(file);
    }
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
        name: capitalizeWords(formData.name),
        phone: formData.phone,
        purpose: capitalizeWords(formData.purpose),
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
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Walk-in Visitor Entry
        </h2>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-start gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-start gap-2 text-sm">
            <Check className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
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
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="10-digit number"
                maxLength={10}
                required
                disabled={formData.otpVerified}
              />
              {!formData.otpVerified ? (
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={formData.phone.length !== 10 || otpLoading}
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm sm:text-base"
                >
                  {otpLoading ? "Sending..." : "Send OTP"}
                </button>
              ) : (
                <div className="px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 whitespace-nowrap text-sm">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Verified</span>
                  <span className="sm:hidden">✓</span>
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
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-white"
            >
              {selectedResident ? (
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">
                    {selectedResident.fullName}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Unit {selectedResident.unitNumber} •{" "}
                    {selectedResident.phoneNumber}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm sm:text-base">
                  Click to select resident
                </div>
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
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base"
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
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              rows={3}
              placeholder="Enter purpose of visit"
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
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              placeholder="e.g., DL01AB1234"
            />
          </div>

          {/* ID Photo Capture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor Photo (Optional)
            </label>

            {!formData.idPhoto ? (
              <div className="space-y-3">
                {/* Take Photo and Upload Photo Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-3 border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Take Photo</span>
                  </button>
                  <label className="cursor-pointer">
                    <div className="px-4 py-3 border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2 font-medium">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm sm:text-base">Upload Photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={skipPhoto}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Skip Photo (Continue without photo)
                </button>
              </div>
            ) : formData.idPhoto === "skipped" ? (
              <div className="p-3 sm:p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Photo skipped - continuing without visitor photo
                </p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, idPhoto: null })}
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 underline"
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
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Captured
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={skipPhoto}
                    className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base sm:text-lg"
          >
            {loading ? "Sending Request..." : "Send Approval Request"}
          </button>
        </form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Capture Visitor Photo
              </h3>
              <button
                onClick={stopCamera}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Video Preview Container - NO MIRROR EFFECT */}
              <div
                className="relative rounded-lg overflow-hidden bg-black"
                style={{ minHeight: "400px" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto object-cover"
                  style={{
                    display: "block",
                    minHeight: "400px",
                  }}
                />

                {/* Loading overlay */}
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <div className="text-white text-sm font-medium">
                      Initializing camera...
                    </div>
                    <div className="text-gray-300 text-xs mt-2">
                      Please allow camera access if prompted
                    </div>
                  </div>
                )}

                {/* Camera active indicator */}
                {cameraReady && (
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Camera Active
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  📸 Position the visitor in the center and click "Capture
                  Photo"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cameraReady ? "Capture Photo" : "Loading..."}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Select Resident
              </h3>
              <button
                onClick={() => setShowResidentSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-3 sm:p-4 border-b">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, unit, or phone..."
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredResidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  No residents found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResidents.map((resident) => (
                    <button
                      key={resident._id}
                      type="button"
                      onClick={() => selectResident(resident)}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {resident.fullName}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        Unit {resident.unitNumber}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400 mt-1">
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
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Verify OTP
              </h3>
              <button
                onClick={() => setShowOTPModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Enter the 6-digit OTP sent to <strong>{formData.phone}</strong>
            </p>

            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
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
                  className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ))}
            </div>

            {resendTimer > 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-500">
                Resend OTP in <strong>{resendTimer}s</strong>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                className="w-full text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
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
