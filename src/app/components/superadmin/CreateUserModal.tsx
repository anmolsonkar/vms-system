"use client";

import React, { useState, useEffect } from "react";
import Modal from "../shared/Modal";
import Input from "../shared/Input";
import Select from "../shared/Select";
import Button from "../shared/Button";
import { AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Property {
  _id: string;
  name: string;
  type: string;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    propertyId: "",
    // Resident specific
    name: "",
    unitNumber: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get("/api/superadmin/properties/list");
      if (response.data.success) {
        setProperties(response.data.data.properties);
      }
    } catch (error) {
      console.error("Fetch properties error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/superadmin/users/create",
        formData
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onSuccess();
          handleClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      role: "",
      propertyId: "",
      name: "",
      unitNumber: "",
      phone: "",
    });
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User"
      size="lg"
    >
      {success ? (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-900">
            User created successfully!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Select
            label="Role"
            required
            options={[
              { value: "", label: "Select Role" },
              { value: "resident", label: "Resident" },
              { value: "guard", label: "Security Guard" },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />

          <Select
            label="Property"
            required
            options={[
              { value: "", label: "Select Property" },
              ...properties.map((p) => ({
                value: p._id,
                label: `${p.name} (${p.type})`,
              })),
            ]}
            value={formData.propertyId}
            onChange={(e) =>
              setFormData({ ...formData, propertyId: e.target.value })
            }
          />

          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="user@example.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Minimum 6 characters"
            helperText="User cannot reset password. They must contact admin."
          />

          {formData.role === "resident" && (
            <>
              <Input
                label="Full Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Resident's full name"
              />

              <Input
                label="Unit Number"
                required
                value={formData.unitNumber}
                onChange={(e) =>
                  setFormData({ ...formData, unitNumber: e.target.value })
                }
                placeholder="e.g., A-101, B-205"
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
              />
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} fullWidth>
              Create User
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
