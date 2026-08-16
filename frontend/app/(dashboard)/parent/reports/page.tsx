"use client";

import { PageHeader } from "@/components/common/AdminUI";
import { ReportsWorkspace } from "@/components/common/ReportsWorkspace";

export default function ParentReportsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Family Progress Reports"
        subtitle="Review, download, and request compiled child academic and behavioral audits"
      />
      <ReportsWorkspace userRole="Parent" />
    </div>
  );
}