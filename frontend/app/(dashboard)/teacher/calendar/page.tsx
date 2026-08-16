"use client";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { PageHeader } from "@/components/common/AdminUI";

export default function TeacherCalendarPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader 
        title="Calendar" 
        subtitle="View and schedule lessons, due dates, and meetings" 
      />
      <CalendarWorkspace userRole="Teacher" />
    </div>
  );
}
