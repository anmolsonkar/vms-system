"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Select from "../shared/Select";
import Input from "../shared/Input";
import CameraCapture from "./CameraCapture";
import OTPVerification from "./OTPVerification";
import IDCardUpload from "./IDCardUpload";
import { CheckCircle, AlertCircle, User } from "lucide-react";
import axios from "axios";

interface Resident {
  _id: string;
  name: string;
  unitNumber: string;
}

interface RegistrationFormProps {
  propertyId: string;
}

export default function RegistrationForm({
  propertyId,
}: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [usePhone, setUsePhone] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    photoUrl: "",
    idCardType: "",
    idCardNumber: "",
    idCardImageUrl: "",
    purpose: "",
    hostResidentId: "",
    vehicleNumber: "",
    numberOfPersons: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchResidents();
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
          }));
        setResidents(residentData);
      }
    } catch (error) {
      console.error("Fetch residents error:", error);
    }
  };

  const handlePhotoCapture = (photoUrl: string) => {
    setFormData({ ...formData, photoUrl });
    setStep(2);
  };

  const handleOTPVerified = () => {
    setStep(3);
  };

  const handleIDCardUpload = (url: string) => {
    setFormData({ ...formData, idCardImageUrl: url });
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
      setStep(2.5); // OTP verification step
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate
      if (!formData.photoUrl) {
        setError("Please capture your photo");
        setLoading(false);
        return;
      }

      if (usePhone && !formData.phone) {
        setError("Please provide phone number");
        setLoading(false);
        return;
      }

      if (!usePhone && !formData.idCardImageUrl) {
        setError("Please upload ID card");
        setLoading(false);
        return;
      }

      // Submit
      const response = await axios.post("/api/visitor/register", {
        propertyId,
        ...formData,
        phone: usePhone ? formData.phone : undefined,
        idCardType: !usePhone ? formData.idCardType : undefined,
        idCardNumber: !usePhone ? formData.idCardNumber : undefined,
        idCardImageUrl: !usePhone ? formData.idCardImageUrl : undefined,
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
          <p className="text-gray-600">Step {step > 2 ? 3 : step} of 3</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Step 1: Photo Capture */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Capture Your Photo
              </h3>
              <CameraCapture onCapture={handlePhotoCapture} />
            </div>
          </div>
        )}

        {/* Step 2: Basic Info & Verification Method */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              usePhone ? sendOTP() : setStep(3);
            }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Enter Your Details
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

              {/* Verification Method Toggle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setUsePhone(true)}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg transition-colors ${
                      usePhone
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Phone Number (OTP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsePhone(false)}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg transition-colors ${
                      !usePhone
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    ID Card
                  </button>
                </div>
              </div>

              {usePhone ? (
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
              ) : (
                <>
                  <Select
                    label="ID Card Type"
                    required
                    options={[
                      { value: "", label: "Select ID Type" },
                      { value: "aadhaar", label: "Aadhaar Card" },
                      { value: "pan", label: "PAN Card" },
                      { value: "driving_license", label: "Driving License" },
                      { value: "passport", label: "Passport" },
                      { value: "other", label: "Other" },
                    ]}
                    value={formData.idCardType}
                    onChange={(e) =>
                      setFormData({ ...formData, idCardType: e.target.value })
                    }
                    className="mb-4"
                  />

                  <Input
                    label="ID Card Number (Optional)"
                    value={formData.idCardNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, idCardNumber: e.target.value })
                    }
                    placeholder="Enter ID card number"
                    className="mb-4"
                  />

                  <IDCardUpload onUpload={handleIDCardUpload} />
                </>
              )}
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {usePhone ? "Send OTP" : "Continue"}
            </Button>
          </form>
        )}

        {/* Step 2.5: OTP Verification */}
        {step === 2.5 && (
          <div>
            <OTPVerification
              phone={formData.phone}
              onVerified={handleOTPVerified}
            />
          </div>
        )}

        {/* Step 3: Visit Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Visit Details
              </h3>

              <div className="space-y-4">
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
                    placeholder="Enter purpose of visit"
                  />
                </div>

                <Select
                  label="Whom to Meet"
                  required
                  options={[
                    { value: "", label: "Select Resident" },
                    ...residents.map((r) => ({
                      value: r._id,
                      label: `${r.name} - Unit ${r.unitNumber}`,
                    })),
                  ]}
                  value={formData.hostResidentId}
                  onChange={(e) =>
                    setFormData({ ...formData, hostResidentId: e.target.value })
                  }
                />

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
    </div>
  );
}
