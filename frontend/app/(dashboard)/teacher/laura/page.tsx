"use client";

import LauraAIWorkspace from "@/components/laura/LauraWorkspace";
import { PageHeader } from "@/components/common/AdminUI";
import { BrainCircuit } from "lucide-react";

export default function TeacherLauraPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-teal-500/10 rounded-xl">
          <BrainCircuit className="h-6 w-6 text-teal-500" />
        </div>
        <PageHeader title="Laura AI Assistant" subtitle="Consult your copilot to build lesson objectives, draft responses, and get remediation advice" />
      </div>
      <LauraAIWorkspace />
    </div>
  );
}
