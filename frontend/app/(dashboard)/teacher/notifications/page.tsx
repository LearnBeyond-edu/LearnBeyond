"use client";

import { useNotifications, PLATFORM_KEYS } from "@/hooks/usePlatform";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/platformService";
import { toast } from "sonner";
import { Bell, Trash2, CheckCircle, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { PageHeader, EmptyState, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.notifications });
      toast.success("Notification dismissed");
    },
    onError: () => toast.error("Failed to dismiss notification"),
  });

  const notifications = data?.data ?? [];
  const filtered = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.message.toLowerCase().includes(search.toLowerCase());
    const matchesUnread = filterUnread ? !n.is_read : true;
    return matchesSearch && matchesUnread;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5 text-xs">
      <PageHeader
        title="Notifications Center"
        subtitle="Manage and view your real-time alerts, grades, assignments, and AI recommendations"
      />

      {/* Filter and Search Box */}
      <div className="flex gap-2 items-center bg-card border border-border/60 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search alerts message text..." 
            className="pl-9 h-8 text-[11px] rounded-lg" 
          />
        </div>
        <Button 
          variant={filterUnread ? "default" : "outline"} 
          size="sm"
          className={`h-8 text-[10px] rounded-lg ${filterUnread ? "bg-teal-600 hover:bg-teal-700 text-white" : ""}`}
          onClick={() => setFilterUnread(!filterUnread)}
        >
          Unread Only
        </Button>
      </div>

      {isError ? (
        <ErrorState error="Failed to load notifications" onRetry={refetch} />
      ) : isLoading ? (
        <Card><CardContent className="p-6"><TableSkeleton rows={5} cols={3} /></CardContent></Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="h-14 w-14 text-teal-600/45 animate-pulse" />}
          title="All caught up!"
          description="No matching notifications at this time."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((n) => (
            <Card key={n.id} className={`transition-all border-border/60 ${n.is_read ? "opacity-60" : "bg-teal-500/5"}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${n.is_read ? "bg-muted" : "bg-teal-500/10 text-teal-600"}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs">{n.title}</p>
                    <p className="text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {format(new Date(n.created_at), "PPp")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0 rounded-lg"
                    onClick={() => deleteNotif(n.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
