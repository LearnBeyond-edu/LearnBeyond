"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/AdminUI";
import { StaffTherapistChat } from "@/components/teletherapy/StaffTherapistChat";
import { TeacherParentChat } from "@/components/school/TeacherParentChat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TeacherMessagesPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Message Center"
        subtitle="Communicate with parents or consult with the clinical therapy team."
      />

      <Tabs defaultValue="parents" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="parents">Parent Conversations</TabsTrigger>
          <TabsTrigger value="therapists">Clinical Therapy Team</TabsTrigger>
        </TabsList>

        <TabsContent value="parents">
          <TeacherParentChat />
        </TabsContent>

        <TabsContent value="therapists">
          <StaffTherapistChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}
