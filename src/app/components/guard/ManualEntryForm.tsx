'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, User, Search, Check, AlertCircle } from 'lucide-react';

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
  vehicleNumber: string;
  idPhoto: string | null;
}

export default function WalkInVisitorEntry() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showResidentSelector, setShowResidentSelector] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<VisitorFormData>({
    name: '',
    phone: '',
    purpose: '',
    residentId: '',
    vehicleNumber: '',
    idPhoto: null,
  });

  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // Fetch residents on component mount
  useEffect(() => {
    fetchResidents();
  }, []);

  // Filter residents based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
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

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/superadmin/users/list?role=resident');
      const data = await response.json();

      if (data.success) {
        setResidents(data.data.users || []);
        setFilteredResidents(data.data.users || []);
      } else {
        setError('Failed to load residents');
      }
    } catch (err) {
      console.error('Failed to fetch residents:', err);
      setError('Failed to load residents');
    }
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions.');
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
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setFormData({ ...formData, idPhoto: imageData });
        stopCamera();
        setSuccess('ID photo captured successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  const retakePhoto = () => {
    setFormData({ ...formData, idPhoto: null });
  };

  // Resident Selection Functions
  const openResidentSelector = () => {
    setShowResidentSelector(true);
    setSearchQuery('');
  };

  const selectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setFormData({ ...formData, residentId: resident._id });
    setShowResidentSelector(false);
    setSearchQuery('');
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.name || !formData.phone || !formData.purpose || !formData.residentId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.idPhoto) {
      setError('Please capture visitor ID photo');
      return;
    }

    if (formData.phone.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    try {
      setLoading(true);

      const visitorData = {
        name: formData.name,
        phone: formData.phone,
        purpose: formData.purpose,
        residentId: formData.residentId,
        vehicleNumber: formData.vehicleNumber || undefined,
        idPhoto: formData.idPhoto,
        type: 'walk-in',
        status: 'pending', // Pending approval from resident
      };

      console.log('📤 Submitting visitor entry:', { ...visitorData, idPhoto: '[BASE64_IMAGE]' });

      const response = await fetch('/api/guard/visitors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Visitor entry created! Approval request sent to resident.');
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          purpose: '',
          residentId: '',
          vehicleNumber: '',
          idPhoto: null,
        });
        setSelectedResident(null);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || 'Failed to create visitor entry');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to create visitor entry');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Walk-in Visitor Entry</h2>

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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter visitor name"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: value });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              required
            />
          </div>

          {/* Whom to Meet - Resident Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Whom to Meet <span className="text-red-500">*</span>
            </label>
            <div
              onClick={openResidentSelector}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white"
            >
              {selectedResident ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{selectedResident.fullName}</div>
                    <div className="text-sm text-gray-500">
                      Unit {selectedResident.unitNumber} • {selectedResident.phoneNumber}
                    </div>
                  </div>
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              ) : (
                <div className="flex items-center justify-between text-gray-400">
                  <span>Click to select resident</span>
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Purpose of Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Visit <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select purpose</option>
              <option value="personal">Personal Visit</option>
              <option value="delivery">Delivery</option>
              <option value="service">Service/Maintenance</option>
              <option value="business">Business Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Vehicle Number (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Number (Optional)
            </label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={(e) =>
                setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., DL01AB1234"
            />
          </div>

          {/* ID Photo Capture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visitor ID Photo <span className="text-red-500">*</span>
            </label>

            {!formData.idPhoto ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Camera className="w-6 h-6" />
                <span className="font-medium">Capture ID Photo</span>
              </button>
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
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retake Photo
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
          >
            {loading ? 'Sending Request...' : 'Send Approval Request'}
          </button>
        </form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Capture ID Photo</h3>
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
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </button>
              </div>
            </div>

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Resident Selector Modal */}
      {showResidentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Select Resident</h3>
              <button
                onClick={() => setShowResidentSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, unit, or phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Resident List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredResidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No residents found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredResidents.map((resident) => (
                    <button
                      key={resident._id}
                      type="button"
                      onClick={() => selectResident(resident)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{resident.fullName}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Unit {resident.unitNumber}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {resident.phoneNumber} • {resident.email}
                          </div>
                        </div>
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}