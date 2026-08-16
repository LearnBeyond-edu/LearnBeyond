"use client";

import { useNotifications } from "@/hooks/usePlatform";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/platformService";
import { PLATFORM_KEYS } from "@/hooks/usePlatform";
import { toast } from "sonner";
import { Bell, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { PageHeader, EmptyState, ErrorState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const queryClient = useQueryClient();

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.notifications });
      toast.success("Notification dismissed");
    },
    onError: () => toast.error("Failed to dismiss notification"),
  });

  const notifications = data?.data ?? [];

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="Platform-wide announcements and system alerts"
      />

      {isError ? (
        <ErrorState error="Failed to load notifications" onRetry={refetch} />
      ) : isLoading ? (
        <Card><CardContent className="p-6"><TableSkeleton rows={5} cols={3} /></CardContent></Card>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="h-14 w-14" />}
          title="All caught up!"
          description="No notifications at this time."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={`transition-all ${n.is_read ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${n.is_read ? "bg-muted" : "bg-primary/10"}`}>
                    <Bell className={`h-4 w-4 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(new Date(n.created_at), "PPp")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
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
