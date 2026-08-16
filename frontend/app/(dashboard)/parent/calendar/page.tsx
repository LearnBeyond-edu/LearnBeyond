"use client";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { PageHeader } from "@/components/common/AdminUI";

export default function ParentCalendarPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader 
        title="Family Calendar & IEP Timeline" 
        subtitle="Stay updated on homework deadlines, therapeutic logs, and parent-teacher conferences" 
      />
      <CalendarWorkspace userRole="Parent" />
    </div>
  );
}
