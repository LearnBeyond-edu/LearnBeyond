"use client";

import { Brain } from "lucide-react";
import { useTherapists } from "@/hooks/useSchool";
import { PeopleDirectory } from "@/components/school/PeopleDirectory";
import { AddStaffDialog } from "@/components/school/AddStaffDialog";
import { useAuthStore } from "@/store/useAuthStore";

export default function TherapistsPage() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useTherapists();
  const { user } = useAuthStore();
  const therapists = data?.pages.flatMap((p) => p?.data || []) ?? [];

  return (
    <PeopleDirectory
      title="Therapists"
      subtitle={`${therapists.length} therapists assigned to your institution`}
      people={therapists}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      detailBasePath="/school/therapists"
      accentColor="bg-orange-500/10 text-orange-600"
      icon={<Brain className="h-14 w-14" />}
      actionButton={<AddStaffDialog role="Therapist" institutionId={user?.institutionId || ""} />}
    />
  );
}
