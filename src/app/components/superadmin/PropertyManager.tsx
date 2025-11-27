"use client";

import React, { useState, useEffect } from "react";
import Card from "../shared/Card";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import Input from "../shared/Input";
import Select from "../shared/Select";
import LoadingSpinner from "../shared/LoadingSpinner";
import { Building, QrCode, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface Property {
  _id: string;
  name: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  qrCode?: string;
  createdAt: string;
}

export default function PropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/superadmin/properties/list");
      if (response.data.success) {
        setProperties(response.data.data.properties);
      }
    } catch (error) {
      console.error("Fetch properties error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreateLoading(true);

    try {
      // Simple property data structure
      const propertyData = {
        name: formData.name,
        type: formData.type,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: "India",
        },
      };

      console.log("Sending property data:", propertyData);

      const response = await axios.post(
        "/api/superadmin/properties/create",
        propertyData
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        alert("Property created successfully!");
        setShowCreateModal(false);
        setFormData({
          name: "",
          type: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
        });
        fetchProperties();
      }
    } catch (error: any) {
      console.error("Create property error:", error.response?.data);
      setError(error.response?.data?.error || "Failed to create property");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewQR = (qrCode: string) => {
    setSelectedQR(qrCode);
    setShowQRModal(true);
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "apartment":
        return "info";
      case "warehouse":
        return "warning";
      case "rwa":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading properties..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600 mt-1">Manage all properties</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No properties yet. Create your first property!
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Property
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property._id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {property.name}
                    </h3>
                    <Badge
                      variant={getTypeBadgeVariant(property.type)}
                      size="sm"
                      className="mt-2"
                    >
                      {property.type.toUpperCase()}
                    </Badge>
                  </div>
                  {property.qrCode && (
                    <button
                      onClick={() => handleViewQR(property.qrCode!)}
                      className="text-blue-600 hover:text-blue-700"
                      title="View QR Code"
                    >
                      <QrCode className="h-6 w-6" />
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>{property.address.street}</p>
                  <p>
                    {property.address.city}, {property.address.state} -{" "}
                    {property.address.pincode}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {format(new Date(property.createdAt), "MMM dd, yyyy")}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Property Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setError("");
        }}
        title="Create New Property"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          <Input
            label="Property Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Green Valley Apartments"
          />

          <Select
            label="Property Type"
            required
            options={[
              { value: "", label: "Select Type" },
              { value: "apartment", label: "Apartment Complex" },
              { value: "warehouse", label: "Warehouse" },
              { value: "rwa", label: "RWA/Society" },
              { value: "office", label: "Office Building" },
            ]}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />

          <Input
            label="Street Address"
            required
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            placeholder="Complete street address"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="City"
            />

            <Input
              label="State"
              required
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder="State"
            />
          </div>

          <Input
            label="Pincode"
            required
            maxLength={6}
            value={formData.pincode}
            onChange={(e) =>
              setFormData({
                ...formData,
                pincode: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="6-digit pincode"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setError("");
              }}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" loading={createLoading} fullWidth>
              Create Property
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Property QR Code"
        size="md"
      >
        <div className="text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Visitor Registration URL:
            </p>
            <a
              href={selectedQR}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm break-all"
            >
              {selectedQR}
            </a>
          </div>
          <p className="text-sm text-gray-600">
            Share this URL or QR code with visitors to register their visit
          </p>
          <Button onClick={() => window.open(selectedQR, "_blank")} fullWidth>
            Open URL
          </Button>
        </div>
      </Modal>
    </div>
  );
}
