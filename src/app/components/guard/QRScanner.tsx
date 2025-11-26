"use client";

import React from "react";
import Card from "../shared/Card";
import { QrCode } from "lucide-react";

export default function QRScanner() {
  return (
    <Card>
      <div className="text-center py-12">
        <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Scanner</h3>
        <p className="text-gray-600 mb-4">
          QR scanning functionality can be implemented here
        </p>
        <p className="text-sm text-gray-500">
          This is a placeholder component for future QR scanning integration
        </p>
      </div>
    </Card>
  );
}
