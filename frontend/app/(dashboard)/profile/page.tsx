"use client";

import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">My Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your academic achievements, configure cover headers, and update passwords.
        </p>
      </div>
      <ProfileWorkspace userRole="Student" />
    </div>
  );
}
