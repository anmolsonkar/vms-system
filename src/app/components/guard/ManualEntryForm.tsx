"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Input from "../shared/Input";
import Select from "../shared/Select";
import Button from "../shared/Button";
import CameraCapture from "../visitor/CameraCapture";
import IDCardUpload from "../visitor/IDCardUpload";
import { AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

interface Resident {
  _id: string;
  name: string;
  unitNumber: string;
}

export default function ManualEntryForm() {
  const [residents, setResidents] = useState<Resident[]>([]);
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
  const [usePhone, setUsePhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const response = await axios.get(
        "/api/superadmin/users/list?role=resident"
      );
      if (response.data.success) {
        const residentData = response.data.data.users.map((u: any) => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate
      if (!formData.photoUrl) {
        setError("Please capture visitor photo");
        setLoading(false);
        return;
      }

      if (!usePhone && !formData.idCardImageUrl) {
        setError("Please upload ID card");
        setLoading(false);
        return;
      }

      if (usePhone && !formData.phone) {
        setError("Please enter phone number");
        setLoading(false);
        return;
      }

      // Submit
      const response = await axios.post("/api/guard/manual-entry", {
        ...formData,
        phone: usePhone ? formData.phone : undefined,
        idCardType: !usePhone ? formData.idCardType : undefined,
        idCardNumber: !usePhone ? formData.idCardNumber : undefined,
        idCardImageUrl: !usePhone ? formData.idCardImageUrl : undefined,
      });

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setFormData({
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
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to register visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Walk-in Visitor Entry
      </h2>

      {error && (
        <div className="mb-4 flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">
            Visitor registered successfully! Awaiting resident approval.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visitor Photo <span className="text-red-500">*</span>
          </label>
          <CameraCapture
            onCapture={(photoUrl) => setFormData({ ...formData, photoUrl })}
          />
        </div>

        {/* Name */}
        <Input
          label="Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter visitor's full name"
        />

        {/* Verification Method Toggle */}
        <div>
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
              Phone Number
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

        {/* Phone or ID Card */}
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
            />

            <Input
              label="ID Card Number"
              value={formData.idCardNumber}
              onChange={(e) =>
                setFormData({ ...formData, idCardNumber: e.target.value })
              }
              placeholder="Enter ID card number"
            />

            <IDCardUpload
              onUpload={(url) =>
                setFormData({ ...formData, idCardImageUrl: url })
              }
            />
          </>
        )}

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
            placeholder="Enter purpose of visit"
          />
        </div>

        {/* Host Resident */}
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

        {/* Optional Fields */}
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

        {/* Submit */}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Register Walk-in Visitor
        </Button>
      </form>
    </Card>
  );
}
