"use client";

import React, { useState, useEffect } from "react";
import { Bell, Trash2, CheckCircle2, AlertCircle, Sparkles, BookOpen, MessageSquare } from "lucide-react";
import { useNotifications, PLATFORM_KEYS } from "@/hooks/usePlatform";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/platformService";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NotificationDropdown() {
  const { data, isLoading, isError } = useNotifications();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();

  const getRolePrefix = () => {
    switch (user?.role) {
      case "Platform Admin": return "/admin";
      case "Institution Admin": return "/school";
      case "Teacher": return "/teacher";
      case "Therapist": return "/therapist";
      case "Parent": return "/parent";
      default: return "/student";
    }
  };

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.notifications });
      toast.success("Notification dismissed");
    },
    onError: () => toast.error("Failed to dismiss notification"),
  });

  useEffect(() => {
    // Listen for local sender toast
    const handleNewMessage = (e: any) => {
      toast(e.detail.title, {
        description: e.detail.message,
        icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
      });
    };
    
    // Listen for cross-tab incoming notifications using localStorage pub/sub
    const handleStorageEvent = (e: StorageEvent) => {
       if (e.key === `notify-user-${user?.id}` && e.newValue) {
          toast("New Message", {
             description: "You have received a new message.",
             icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
          });
          queryClient.invalidateQueries({ queryKey: PLATFORM_KEYS.notifications });
       }
    };
    
    window.addEventListener('newMessageNotification', handleNewMessage);
    window.addEventListener('storage', handleStorageEvent);
    
    return () => {
       window.removeEventListener('newMessageNotification', handleNewMessage);
       window.removeEventListener('storage', handleStorageEvent);
    };
  }, [user?.id, queryClient]);

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("laura") || title.toLowerCase().includes("ai")) {
      return <Sparkles className="h-3.5 w-3.5 text-purple-500" />;
    }
    if (title.toLowerCase().includes("homework") || title.toLowerCase().includes("lesson")) {
      return <BookOpen className="h-3.5 w-3.5 text-blue-500" />;
    }
    return <Bell className="h-3.5 w-3.5 text-teal-600" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-muted/40 transition-all focus:outline-none shrink-0">
        <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] px-1 flex items-center justify-center bg-red-600 text-white border-2 border-background text-[8px] font-extrabold rounded-full">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2 text-xs" align="end">
        <div className="flex justify-between items-center px-2 py-1.5">
          <span className="font-bold text-xs flex items-center gap-1">
            <Bell className="h-4 w-4 text-teal-600" /> Notifications
          </span>
          {unreadCount > 0 && (
            <Badge variant="outline" className="text-[8px] uppercase tracking-wide text-teal-600 bg-teal-500/5 font-extrabold">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[280px] overflow-y-auto space-y-1 py-1">
          {isLoading ? (
            <p className="text-center py-6 text-muted-foreground italic">Fetching alerts...</p>
          ) : isError ? (
            <p className="text-center py-6 text-red-500 italic">Error loading alerts.</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-teal-600/30 mb-2" />
              <p className="font-semibold">All caught up!</p>
              <p className="text-[9px] mt-0.5">No notifications at this time.</p>
            </div>
          ) : (
            notifications.map(n => {
              const isMessage = n.title.toLowerCase().includes("message");
              return (
                <div 
                  key={n.id} 
                  onClick={() => {
                    if (isMessage) {
                      router.push(`${getRolePrefix()}/messages`);
                      deleteNotif(n.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/10 flex items-start gap-2.5 transition-all ${
                    n.is_read ? "opacity-60" : "bg-teal-500/5"
                  } ${isMessage ? "cursor-pointer" : ""}`}
                >
                  <div className="p-1.5 bg-muted rounded-lg shrink-0 mt-0.5">
                    {getIcon(n.title)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="font-bold truncate text-[11px]">{n.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[8px] text-muted-foreground font-medium pt-1">
                      {format(new Date(n.created_at), "PPp")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                       e.stopPropagation();
                       deleteNotif(n.id);
                    }}
                    className="text-muted-foreground hover:text-red-500 p-1 rounded-md"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="p-1">
          <Button 
            variant="ghost" 
            className="w-full text-center text-[10px] h-8 rounded-lg font-bold text-teal-600 hover:text-teal-700"
            onClick={() => router.push(`${getRolePrefix()}/notifications`)}
          >
            Manage Notifications Page
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
