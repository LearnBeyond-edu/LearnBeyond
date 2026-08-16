"use client";

import { useStudents, useDeleteStudent } from "@/hooks/useSchool";
import { PeopleDirectory } from "@/components/school/PeopleDirectory";
import { GraduationCap } from "lucide-react";
import { AddStaffDialog } from "@/components/school/AddStaffDialog";
import { useAuthStore } from "@/store/useAuthStore";

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useStudents(50);
  const students = data?.pages.flatMap((p) => p.data) ?? [];
  const { mutate: deleteStudent, isPending: isDeleting } = useDeleteStudent();

  return (
    <PeopleDirectory
      title="Students"
      subtitle="Directory of students enrolled in your classes"
      people={students}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      detailBasePath="/teacher/students"
      icon={<GraduationCap className="h-5 w-5" />}
      accentColor="bg-emerald-500/10 text-emerald-600"
      actionButton={<AddStaffDialog role="Student" institutionId={user?.institutionId || ""} />}
      onDelete={deleteStudent}
      isDeleting={isDeleting}
    />
  );
}
