"use client";

import { Users } from "lucide-react";
import { useTeachers, useDeleteTeacher } from "@/hooks/useSchool";
import { PeopleDirectory } from "@/components/school/PeopleDirectory";
import { AddStaffDialog } from "@/components/school/AddStaffDialog";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeachersPage() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useTeachers();
  const { mutate: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();
  const { user } = useAuthStore();

  const teachers = data?.pages.flatMap((p) => p?.data || []) ?? [];

  return (
    <PeopleDirectory
      title="Teachers"
      subtitle={`${teachers.length} teachers in your institution`}
      people={teachers}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      detailBasePath="/school/teachers"
      accentColor="bg-violet-500/10 text-violet-500"
      icon={<Users className="h-14 w-14" />}
      onDelete={(id) => deleteTeacher(id)}
      isDeleting={isDeleting}
      actionButton={<AddStaffDialog role="Teacher" institutionId={user?.institutionId || ""} />}
    />
  );
}
