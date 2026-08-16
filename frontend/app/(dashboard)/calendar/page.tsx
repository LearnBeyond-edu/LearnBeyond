"use client";

import { CalendarWorkspace } from "@/components/calendar/CalendarWorkspace";
import { GraduationCap } from "lucide-react";

export default function StudentCalendarPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-teal-600" />
          My Study Schedule
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your upcoming class sessions, quiz schedules, IEP consultations, and assignments.
        </p>
      </div>

      <CalendarWorkspace userRole="Student" />
    </div>
  );
}
