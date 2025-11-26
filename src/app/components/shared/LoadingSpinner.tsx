"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = "md",
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2
            className={clsx("animate-spin text-blue-600 mx-auto", sizes[size])}
          />
          {text && <p className="mt-4 text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className={clsx("animate-spin text-blue-600", sizes[size])} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
}
