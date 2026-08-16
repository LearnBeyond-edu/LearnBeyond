"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2, Mail, Phone, MapPin, Pencil, Trash2, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useInstitution, useDeleteInstitution } from "@/hooks/useInstitutions";
import { PageHeader, ErrorState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: institution, isLoading, isError } = useInstitution(id);
  const { mutate: deleteInstitution, isPending: isDeleting } = useDeleteInstitution();
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = () => {
    deleteInstitution(id, {
      onSuccess: () => router.push("/admin/institutions"),
    });
  };

  if (isError) return <ErrorState error="Institution not found or was deleted." />;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/institutions">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <PageHeader
            title={institution?.name ?? ""}
            subtitle="Institution Profile"
            actions={
              <div className="flex gap-2">
                <Link href={`/admin/institutions/${id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            }
          />
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
              ) : (
                <>
                  <CardTitle>{institution?.name}</CardTitle>
                  <CardDescription>ID: {institution?.id}</CardDescription>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem icon={<Mail />} label="Contact Email" value={institution?.email ?? "—"} />
              <InfoItem icon={<Phone />} label="Contact Phone" value={institution?.phone ?? "—"} />
              <InfoItem icon={<MapPin />} label="Address" value={institution?.address ?? "—"} />
              <InfoItem
                icon={<Calendar />}
                label="Registered"
                value={institution?.created_at ? format(new Date(institution.created_at), "PPP") : "—"}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Institution</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{institution?.name}</strong>? This performs a
              soft delete — the record will be hidden but retained in the database.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/30">
      <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}
