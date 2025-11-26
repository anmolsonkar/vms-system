"use client";

import React, { useRef, useState } from "react";
import Button from "../shared/Button";
import { Camera, RefreshCw, CheckCircle } from "lucide-react";
import axios from "axios";

interface CameraCaptureProps {
  onCapture: (photoUrl: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsCameraOn(true);
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Unable to access camera. Please grant camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
      }
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const uploadPhoto = async () => {
    if (!capturedPhoto) return;

    setUploading(true);
    try {
      const response = await axios.post("/api/visitor/upload/photo", {
        photoData: capturedPhoto,
      });

      if (response.data.success) {
        onCapture(response.data.data.photoUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera View or Captured Photo */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {!isCameraOn && !capturedPhoto && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-500" />
          </div>
        )}

        {isCameraOn && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {capturedPhoto && (
          <img
            src={capturedPhoto}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isCameraOn && !capturedPhoto && (
          <Button onClick={startCamera} fullWidth>
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        )}

        {isCameraOn && (
          <Button onClick={capturePhoto} variant="success" fullWidth>
            <Camera className="h-4 w-4 mr-2" />
            Capture Photo
          </Button>
        )}

        {capturedPhoto && (
          <>
            <Button onClick={retake} variant="secondary" fullWidth>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button
              onClick={uploadPhoto}
              variant="success"
              loading={uploading}
              fullWidth
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
