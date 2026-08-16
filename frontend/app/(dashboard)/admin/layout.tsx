"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthGuard } from "@/components/AuthGuard";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { AnnouncementDropdown } from "@/components/layout/AnnouncementDropdown";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["Platform Admin"]}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/30">
          <AdminSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            {/* Top Bar */}
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 backdrop-blur-md px-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <AnnouncementDropdown />
              <NotificationDropdown />
              <ThemeToggle />
            </header>
            {/* Page Content */}
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
