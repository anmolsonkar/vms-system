"use client";

import Link from "next/link";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      <div className="h-24 w-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur mb-6">
        <ShieldAlert className="h-12 w-12 text-purple-200" />
      </div>

      {/* Text */}
      <h1 className="text-white text-7xl font-extrabold tracking-tight">404</h1>
      <h2 className="text-white text-2xl md:text-3xl font-bold mt-4">
        Page Not Found
      </h2>

      <p className="text-purple-200 max-w-md mt-4 text-lg">
        The page you’re looking for doesn’t exist or may have been moved. For
        security reasons, unauthorized paths are not accessible.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-purple-700 font-semibold shadow hover:bg-purple-50 transition"
        >
          <Home className="h-4 w-4 mr-2" />
          Go to Home
        </Link>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-sm text-purple-200">
        © {new Date().getFullYear()} Cybersecure Digital Intelligence Private
        Limited. All rights reserved.
      </footer>
    </div>
  );
}
