"use client";

import { PageHeader } from "@/components/common/AdminUI";
import { StaffTherapistChat } from "@/components/teletherapy/StaffTherapistChat";

export default function TherapistMessagesPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Staff & Teacher Communications"
        subtitle="Discuss student therapy reports and improvements with school staff"
      />
      <StaffTherapistChat />
    </div>
  );
}
