"use client";

import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function TherapistProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Therapist Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your therapist credentials, bio, and change account passwords.
        </p>
      </div>
      <ProfileWorkspace userRole="Therapist" />
    </div>
  );
}
