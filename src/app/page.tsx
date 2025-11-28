"use client";

import Link from "next/link";
import { ShieldCheck, Users, Building2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <img
              src="logo.webp"
              alt="SRM Group Logo"
              className="h-12 w-auto cursor-pointer"
            />
          </Link>
          <span className="text-white font-bold text-xl">SRM Group</span>
        </div>
        <Link
          href="/login"
          className="hidden md:inline-flex items-center text-sm font-semibold text-purple-700 bg-white px-4 py-2 rounded-lg shadow hover:bg-purple-50 transition"
        >
          Admin Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-12">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Visitor Management System
            </h1>
            <p className="text-purple-200 text-lg max-w-xl">
              A secure, modern, and intelligent visitor management solution
              designed for residential societies, corporate parks, and gated
              communities.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur">
                <ShieldCheck className="h-4 w-4 mr-2 text-purple-200" />
                Secure Access
              </div>
              <div className="flex items-center text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur">
                <Users className="h-4 w-4 mr-2 text-purple-200" />
                Role Based Login
              </div>
              <div className="flex items-center text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur">
                <Building2 className="h-4 w-4 mr-2 text-purple-200" />
                Multi-Property Support
              </div>
            </div>
          </div>

          {/* Right Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Admin */}
            <RoleCard
              title="Admin"
              description="Manage properties, users, permissions and reports."
              icon={<Building2 className="h-8 w-8 text-purple-600" />}
              href="/login"
            />

            {/* Resident */}
            <RoleCard
              title="Resident"
              description="Approve visitors and manage your guest entries."
              icon={<Users className="h-8 w-8 text-green-600" />}
              iconBg="bg-green-100"
              href="/login"
            />

            {/* Guard */}
            <RoleCard
              title="Security Guard"
              description="Check-in visitors and control gate access."
              icon={<ShieldCheck className="h-8 w-8 text-purple-600" />}
              iconBg="bg-purple-100"
              href="/login"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-purple-200">
        © {new Date().getFullYear()} Cybersecure Digital Intelligence Private
        Limited. All rights reserved.
      </footer>
    </div>
  );
}

function RoleCard({
  title,
  description,
  icon,
  href,
  iconBg = "bg-purple-100",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  iconBg?: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div
        className={`h-14 w-14 ${iconBg} rounded-full flex items-center justify-center mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
        Access Portal <ArrowRight className="h-4 w-4 ml-1" />
      </div>
    </Link>
  );
}
