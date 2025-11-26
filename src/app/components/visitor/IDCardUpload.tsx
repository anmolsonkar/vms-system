"use client";

import React, { useState, useRef } from "react";
import Button from "../shared/Button";
import { Upload, CheckCircle, FileText } from "lucide-react";
import axios from "axios";

interface IDCardUploadProps {
  onUpload: (idCardUrl: string) => void;
}

export default function IDCardUpload({ onUpload }: IDCardUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      uploadIDCard(result);
    };
    reader.readAsDataURL(file);
  };

  const uploadIDCard = async (fileData: string) => {
    setUploading(true);
    try {
      const response = await axios.post("/api/visitor/upload/id-card", {
        idCardData: fileData,
      });

      if (response.data.success) {
        onUpload(response.data.data.idCardUrl);
        setUploaded(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload ID card");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Upload ID Card <span className="text-red-500">*</span>
      </label>

      {/* Upload Area */}
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload ID card image
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="ID Card"
            className="w-full rounded-lg border-2 border-gray-300"
          />

          {uploaded && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}

          {!uploaded && uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview && !uploading && (
        <Button
          onClick={() => {
            setPreview(null);
            setUploaded(false);
            fileInputRef.current?.click();
          }}
          variant="outline"
          fullWidth
        >
          <FileText className="h-4 w-4 mr-2" />
          Change ID Card
        </Button>
      )}
    </div>
  );
}
