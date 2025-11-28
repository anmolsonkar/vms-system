"use client";

import { Suspense } from "react";
import ResidentClient from "./ResidentClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResidentClient />
    </Suspense>
  );
}
