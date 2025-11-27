"use client";

import React from "react";
import DashboardLayout from "@/app/components/layout/DashboardLayout";
import VisitorHistory from "@/app/components/resident/VisitorHistory";

export default function ResidentHistoryPage() {
  return (
    <DashboardLayout role="resident">
      <VisitorHistory />
    </DashboardLayout>
  );
}
