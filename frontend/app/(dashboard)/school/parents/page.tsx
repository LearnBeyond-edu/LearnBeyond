"use client";

import { Heart } from "lucide-react";
import { useParents } from "@/hooks/useSchool";
import { PeopleDirectory } from "@/components/school/PeopleDirectory";

export default function ParentsPage() {
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useParents();
  const parents = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <PeopleDirectory
      title="Parents"
      subtitle={`${parents.length} parents registered`}
      people={parents}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      detailBasePath="/school/parents"
      accentColor="bg-pink-500/10 text-pink-600"
      icon={<Heart className="h-14 w-14" />}
    />
  );
}
