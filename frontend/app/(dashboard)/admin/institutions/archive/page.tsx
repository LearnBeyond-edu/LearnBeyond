"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Mail, Phone, MapPin, Eye, History } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useInstitutionHistory } from "@/hooks/useInstitutions";
import { PageHeader, TableSkeleton, EmptyState, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Institution } from "@/types/platform";

const PAGE_SIZE = 12;

export default function InstitutionsArchivePage() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useInstitutionHistory(PAGE_SIZE, offset);

  const institutions = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const filtered = institutions.filter((inst) =>
    [inst.name, inst.email, inst.address, inst.phone]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeader
        title="Institution History & Archive"
        subtitle={`Historical view of all ${total} institutions (including relieved/deleted).`}
        actions={
          <Link href="/admin/institutions">
            <Button variant="outline" className="gap-1.5">
              <Building2 className="h-4 w-4" /> Active Institutions
            </Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all records..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isError ? (
        <ErrorState error="Failed to load history" onRetry={refetch} />
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={8} cols={5} />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<History className="h-14 w-14" />}
          title="No history found"
          description={search ? "Try a different search term." : "No institutions have ever been registered."}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((inst) => (
            <ArchivedInstitutionCard key={inst.id} institution={inst} />
          ))}
        </motion.div>
      )}

      {totalPages > 1 && !search && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchivedInstitutionCard({ institution }: { institution: Institution }) {
  const isDeleted = !!institution.deleted_at;

  return (
    <Card className={`group hover:shadow-md transition-all ${isDeleted ? 'opacity-80 grayscale-[30%]' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDeleted ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <Building2 className={`h-5 w-5 ${isDeleted ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{institution.name}</h3>
              <p className="text-xs text-muted-foreground">
                Added {format(new Date(institution.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          {isDeleted ? (
            <Badge variant="destructive" className="text-[10px]">Relieved</Badge>
          ) : (
            <Badge variant="default" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none">Active</Badge>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {institution.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{institution.email}</span>
            </div>
          )}
          {institution.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{institution.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t pt-3">
          <Link href={`/admin/institutions/${institution.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Eye className="h-3.5 w-3.5" /> View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
