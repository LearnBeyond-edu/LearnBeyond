"use client";

import { PageHeader } from "@/components/common/AdminUI";
import { ReportsWorkspace } from "@/components/common/ReportsWorkspace";

export default function TherapistReportsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Clinical Reports"
        subtitle="Generate and download comprehensive student therapeutic progress reports"
      />
      <ReportsWorkspace userRole="Therapist" />
    </div>
  );
}
