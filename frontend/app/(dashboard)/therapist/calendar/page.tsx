"use client";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { PageHeader } from "@/components/common/AdminUI";

export default function TherapistCalendarPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader 
        title="Therapist Schedule & Calendar" 
        subtitle="Manage sensory therapy sessions, clinical assessments, and parent conferences" 
      />
      <CalendarWorkspace userRole="Therapist" />
    </div>
  );
}
