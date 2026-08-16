"use client";

import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Platform Administrator Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your supervisor admin credentials, bio, and change account passwords.
        </p>
      </div>
      <ProfileWorkspace userRole="Platform Admin" />
    </div>
  );
}
