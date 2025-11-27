"use client";

import React, { useState, useEffect, useRef } from "react";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Input from "../shared/Input";
import OTPVerification from "./OTPVerification";
import { CheckCircle, AlertCircle, Camera, X } from "lucide-react";
import axios from "axios";

interface Resident {
  _id: string;
  name: string;
  unitNumber: string;
  phoneNumber: string;
}

interface RegistrationFormProps {
  propertyId: string;
}

export default function RegistrationForm({
  propertyId,
}: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    idCardImageUrl: "",
    purpose: "",
    hostResidentId: "",
    hostUnitNumber: "",
    hostPhoneNumber: "",
    vehicleNumber: "",
    numberOfPersons: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await axios.get(
        "/api/superadmin/users/list?role=resident&propertyId=" + propertyId
      );
      if (response.data.success) {
        const residentData = response.data.data.users
          .filter((u: any) => u.residentDetails)
          .map((u: any) => ({
            _id: u.residentDetails._id,
            name: u.residentDetails.name,
            unitNumber: u.residentDetails.unitNumber,
            phoneNumber: u.phoneNumber || "",
          }));
        setResidents(residentData);
      }
    } catch (error) {
      console.error("Fetch residents error:", error);
    }
  };

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

  const captureIDCard = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setFormData({ ...formData, idCardImageUrl: imageData });
        stopCamera();
      }
    }
  };

  const retakeIDCard = () => {
    setFormData({ ...formData, idCardImageUrl: "" });
  };

  const handleResidentSelect = (residentId: string) => {
    const resident = residents.find((r) => r._id === residentId);
    if (resident) {
      setFormData({
        ...formData,
        hostResidentId: residentId,
        hostUnitNumber: resident.unitNumber,
        hostPhoneNumber: resident.phoneNumber,
      });
    }
  };

  const sendOTP = async () => {
    if (!formData.phone || formData.phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/visitor/send-otp", {
        phone: formData.phone,
      });
      setStep(1.5);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.idCardImageUrl) {
        setError("Please capture ID card photo");
        setLoading(false);
        return;
      }

      if (!formData.phone) {
        setError("Please provide phone number");
        setLoading(false);
        return;
      }

      const response = await axios.post("/api/visitor/register", {
        propertyId,
        name: formData.name,
        phone: formData.phone,
        idCardImageUrl: formData.idCardImageUrl,
        purpose: formData.purpose,
        hostResidentId: formData.hostResidentId,
        vehicleNumber: formData.vehicleNumber,
        numberOfPersons: formData.numberOfPersons,
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-2">
            Your visit request has been sent to the resident.
          </p>
          <p className="text-gray-600">
            You will receive a notification once approved.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Visitor Registration
          </h2>
          <p className="text-gray-600">Step {step > 1 ? 2 : 1} of 2</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Step 1: Phone & Name */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendOTP();
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Enter Your Details
              </h3>

              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                className="mb-4"
              />

              <Input
                label="Phone Number"
                type="tel"
                required
                maxLength={10}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="10-digit mobile number"
                helperText="You will receive an OTP for verification"
              />
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send OTP
            </Button>
          </form>
        )}

        {/* Step 1.5: OTP Verification */}
        {step === 1.5 && (
          <div>
            <OTPVerification
              phone={formData.phone}
              onVerified={handleOTPVerified}
            />
          </div>
        )}

        {/* Step 2: Visit Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Visit Details
              </h3>

              <div className="space-y-4">
                {/* ID Card Capture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Card Photo <span className="text-red-500">*</span>
                  </label>

                  {!formData.idCardImageUrl ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="font-medium">Capture ID Card</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border-2 border-green-500">
                        <img
                          src={formData.idCardImageUrl}
                          alt="Captured ID"
                          className="w-full h-auto"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={retakeIDCard}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter purpose of visit (e.g., Personal visit, Delivery, Business meeting)"
                  />
                </div>

                {/* Resident Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Whom to Meet <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.hostResidentId}
                    onChange={(e) => handleResidentSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Resident</option>
                    {residents.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} - Unit {r.unitNumber} - {r.phoneNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Number (Read-only) */}
                {formData.hostUnitNumber && (
                  <Input
                    label="Unit Number"
                    value={formData.hostUnitNumber}
                    readOnly
                    className="bg-gray-50"
                  />
                )}

                {/* Vehicle Number */}
                <Input
                  label="Vehicle Number (Optional)"
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleNumber: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., DL01AB1234"
                />

                {/* Number of Persons */}
                <Input
                  label="Number of Persons"
                  type="number"
                  min={1}
                  value={formData.numberOfPersons.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfPersons: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Submit Registration
            </Button>
          </form>
        )}
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Capture ID Card Photo
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
                  onClick={captureIDCard}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
}
