"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import RegistrationForm from "@/app/components/visitor/RegistrationForm";

export default function VisitorRegistrationPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid QR Code
          </h2>
          <p className="text-gray-600">
            This QR code is invalid or expired. Please scan a valid QR code to
            register your visit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <RegistrationForm propertyId={propertyId} />
    </div>
  );
}
