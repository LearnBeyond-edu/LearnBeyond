"use client";

import { useParents, useDeleteParent } from "@/hooks/useSchool";
import { PeopleDirectory } from "@/components/school/PeopleDirectory";
import { Users } from "lucide-react";
import { AddStaffDialog } from "@/components/school/AddStaffDialog";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeacherParentsPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useParents(50);
  const parents = data?.pages.flatMap((p) => p.data) ?? [];
  const { mutate: deleteParent, isPending: isDeleting } = useDeleteParent();

  return (
    <PeopleDirectory
      title="Parents"
      subtitle="Directory of parents connected to your students"
      people={parents}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      detailBasePath="/teacher/parents"
      icon={<Users className="h-5 w-5" />}
      accentColor="bg-blue-500/10 text-blue-600"
      actionButton={<AddStaffDialog role="Parent" institutionId={user?.institutionId || ""} />}
      onDelete={deleteParent}
      isDeleting={isDeleting}
    />
  );
}
