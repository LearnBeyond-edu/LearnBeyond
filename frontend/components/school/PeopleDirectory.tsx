"use client";

import { useState } from "react";
import { Search, UserCircle2, Phone, Mail, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, PageHeader } from "@/components/common/AdminUI";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface PersonRecord {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number?: string | null;
  institution_id?: string;
  created_at: string;
}

interface PeopleDirectoryProps {
  title: string;
  subtitle: string;
  people: PersonRecord[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  detailBasePath: string;
  accentColor?: string;
  icon: React.ReactNode;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  actionButton?: React.ReactNode;
}

export function PeopleDirectory({
  title, subtitle, people, isLoading, isError, refetch,
  hasNextPage, isFetchingNextPage, fetchNextPage,
  detailBasePath, accentColor = "bg-violet-500/10 text-violet-500",
  icon, onDelete, isDeleting, actionButton,
}: PeopleDirectoryProps) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PersonRecord | null>(null);

  const filtered = people.filter((p) =>
    [p.first_name, p.last_name, p.phone_number].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const fullName = (p: PersonRecord) =>
    [p.first_name, p.last_name].filter(Boolean).join(" ") || `User ${p.user_id.slice(0, 6)}`;

  return (
    <div className="space-y-5 max-w-6xl">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${title.toLowerCase()}...`} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>

      {isError ? (
        <ErrorState error={`Failed to load ${title.toLowerCase()}`} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<UserCircle2 className="h-14 w-14" />} title={`No ${title.toLowerCase()} found`} description={search ? "Try a different search term." : `No ${title.toLowerCase()} are registered yet.`} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((person) => (
              <Card key={person.id} className="group hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`text-sm font-bold ${accentColor}`}>
                        {(person.first_name?.[0] ?? "?").toUpperCase()}{(person.last_name?.[0] ?? "").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{fullName(person)}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">ID: {person.id.slice(0, 10)}…</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {person.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{person.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono truncate">{person.user_id.slice(0, 14)}…</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Joined {format(new Date(person.created_at), "MMM d, yyyy")}</p>
                  </div>

                  <div className="flex gap-2 border-t pt-3">
                    <Link href={`${detailBasePath}/${person.id}`} className="flex-1" prefetch={false}>
                      <Button variant="outline" size="sm" className="w-full gap-1.5"><Eye className="h-3.5 w-3.5" /> View</Button>
                    </Link>
                    {onDelete && (
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(person)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasNextPage && !search && (
            <div className="text-center">
              <Button variant="outline" onClick={() => fetchNextPage?.()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading…" : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      {onDelete && (
        <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {title.slice(0, -1)}</DialogTitle>
              <DialogDescription>Remove <strong>{deleteTarget ? fullName(deleteTarget) : ""}</strong>? This is a soft delete.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" disabled={isDeleting} onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}>
                {isDeleting ? "Removing…" : "Remove"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
