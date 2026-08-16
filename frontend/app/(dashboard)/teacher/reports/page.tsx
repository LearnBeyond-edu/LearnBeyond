"use client";

import { PageHeader } from "@/components/common/AdminUI";
import { ReportsWorkspace } from "@/components/common/ReportsWorkspace";

export default function TeacherReportsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        subtitle="Generate and download class academic summaries and attendance statements" 
      />
      <ReportsWorkspace userRole="Teacher" />
    </div>
  );
}
