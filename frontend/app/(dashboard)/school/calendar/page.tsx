"use client";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { PageHeader } from "@/components/common/AdminUI";

export default function SchoolCalendarPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader 
        title="Institution Calendar" 
        subtitle="Manage term timetables, school holidays, staff briefings, and events" 
      />
      <CalendarWorkspace userRole="Institution Admin" />
    </div>
  );
}
