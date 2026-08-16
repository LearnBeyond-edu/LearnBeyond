"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Building2, Mail, Phone, MapPin, Trash2, Pencil, Eye, History } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useInstitutions, useDeleteInstitution } from "@/hooks/useInstitutions";
import { PageHeader, TableSkeleton, EmptyState, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Institution } from "@/types/platform";

const PAGE_SIZE = 10;

export default function InstitutionsPage() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);

  const { data, isLoading, isError, refetch } = useInstitutions(PAGE_SIZE, offset);
  const { mutate: deleteInstitution, isPending: isDeleting } = useDeleteInstitution();

  const institutions = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  // Client-side search filter (backend doesn't have search endpoint)
  const filtered = institutions.filter((inst) =>
    [inst.name, inst.email, inst.address, inst.phone]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteInstitution(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <PageHeader
        title="Institutions"
        subtitle={`${total} institution${total !== 1 ? "s" : ""} registered on the platform`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/institutions/archive">
              <Button variant="outline" className="gap-1.5">
                <History className="h-4 w-4" /> View History
              </Button>
            </Link>
            <Link href="/admin/institutions/create">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Institution
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutions..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <ErrorState error="Failed to load institutions" onRetry={refetch} />
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={8} cols={5} />
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-14 w-14" />}
          title="No institutions found"
          description={search ? "Try a different search term." : "Create your first institution to get started."}
          action={
            !search && (
              <Link href="/admin/institutions/create">
                <Button>Add Institution</Button>
              </Link>
            )
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((inst) => (
            <InstitutionCard
              key={inst.id}
              institution={inst}
              onDelete={() => setDeleteTarget(inst)}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Institution</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action performs
              a soft delete and can be reviewed by a database administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Institution"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Institution Card ──────────────────────────────────────────────────────────

function InstitutionCard({
  institution,
  onDelete,
}: {
  institution: Institution;
  onDelete: () => void;
}) {
  return (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{institution.name}</h3>
            <p className="text-xs text-muted-foreground">
              Added {format(new Date(institution.created_at), "MMM d, yyyy")}
            </p>
          </div>
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
          {institution.address && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{institution.address}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t pt-3">
          <Link href={`/admin/institutions/${institution.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Eye className="h-3.5 w-3.5" /> View
            </Button>
          </Link>
          <Link href={`/admin/institutions/${institution.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
