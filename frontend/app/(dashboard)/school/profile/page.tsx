"use client";

import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function SchoolProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Institution Administrator Profile</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure security credentials and view directory logins.
        </p>
      </div>
      <ProfileWorkspace userRole="Institution Admin" />
    </div>
  );
}
