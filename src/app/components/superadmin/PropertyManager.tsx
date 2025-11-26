'use client';

import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Building, QrCode, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

interface Property {
  _id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  qrCodeUrl: string;
  createdAt: string;
}

export default function PropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/superadmin/properties/list');
      if (response.data.success) {
        setProperties(response.data.data.properties);
      }
    } catch (error) {
      console.error('Fetch properties error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const response = await axios.post('/api/superadmin/properties/create', formData);

      if (response.data.success) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          type: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
        });
        fetchProperties();
      }
    } catch (error) {
      console.error('Create property error:', error);
      alert('Failed to create property');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleViewQR = (qrCodeUrl: string) => {
    setSelectedQR(qrCodeUrl);
    setShowQRModal(true);
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'info';
      case 'warehouse':
        return 'warning';
      case 'rwa':
        return 'success';
      default:
        return 'default';
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
            <p className="text-gray-500">No properties yet</p>
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
                    <Badge variant={getTypeBadgeVariant(property.type)} size="sm" className="mt-2">
                      {property.type.toUpperCase()}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleViewQR(property.qrCodeUrl)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <QrCode className="h-6 w-6" />
                  </button>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>{property.address}</p>
                  <p>{property.city}, {property.state} - {property.pincode}</p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center text-xs text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {format(new Date(property.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Property Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Property"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
              { value: '', label: 'Select Type' },
              { value: 'apartment', label: 'Apartment Complex' },
              { value: 'warehouse', label: 'Warehouse' },
              { value: 'rwa', label: 'RWA/Society' },
            ]}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />

          <Input
            label="Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />

            <Input
              label="State"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
            />
          </div>

          <Input
            label="Pincode"
            required
            maxLength={6}
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
            placeholder="6-digit pincode"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
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
          <img
            src={selectedQR}
            alt="QR Code"
            className="mx-auto border-2 border-gray-200 rounded-lg"
          />
          <p className="text-sm text-gray-600">
            Visitors can scan this QR code to register their visit
          </p>
          <Button
            onClick={() => window.open(selectedQR, '_blank')}
            fullWidth
          >
            Download QR Code
          </Button>
        </div>
      </Modal>
    </div>
  );
}