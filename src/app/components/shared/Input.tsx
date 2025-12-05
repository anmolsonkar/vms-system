"use client";

import React from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx("flex flex-col", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={clsx(
          "px-4 py-2 border rounded-lg transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          "disabled:bg-gray-100 disabled:cursor-not-allowed",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 hover:border-gray-400",
          className
        )}
        {...props}
      />

      {error && <span className="mt-1 text-sm text-red-600">{error}</span>}

      {helperText && !error && (
        <span className="mt-1 text-sm text-gray-500">{helperText}</span>
      )}
    </div>
  );
}
