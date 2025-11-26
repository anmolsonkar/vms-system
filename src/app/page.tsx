// src/app/page.tsx
"use client";

import Link from "next/link";
import { Building, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            Visitor Management System
          </h1>
          <p className="text-xl text-gray-600">
            Secure, Efficient, and Modern Visitor Management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* SuperAdmin Card */}
          <Link href="/login" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                SuperAdmin
              </h3>
              <p className="text-gray-600 mb-4">
                Manage properties, users, and system settings
              </p>
              <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                Access Portal →
              </div>
            </div>
          </Link>

          {/* Resident Card */}
          <Link href="/login" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Resident</h3>
              <p className="text-gray-600 mb-4">
                Approve visitors and manage your guests
              </p>
              <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                Access Portal →
              </div>
            </div>
          </Link>

          {/* Guard Card */}
          <Link href="/login" className="group">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Security Guard
              </h3>
              <p className="text-gray-600 mb-4">
                Check-in visitors and manage gate access
              </p>
              <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center">
                Access Portal →
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600">
            New visitor?{" "}
            <Link
              href="/visitor/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
