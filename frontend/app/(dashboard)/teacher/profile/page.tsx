"use client";

import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function TeacherProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Staff Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your staff credentials, bio, and change account passwords.
        </p>
      </div>
      <ProfileWorkspace userRole="Teacher" />
    </div>
  );
}
