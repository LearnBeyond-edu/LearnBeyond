import { AuthGuard } from "@/components/auth/AuthGuard";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TherapistSidebar } from "@/components/layout/TherapistSidebar";
import { UserNav } from "@/components/layout/UserNav";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { AnnouncementDropdown } from "@/components/layout/AnnouncementDropdown";

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["Therapist", "Platform Admin"]}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <TherapistSidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 sticky top-0 z-40">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              <div className="flex items-center gap-2">
                <AnnouncementDropdown />
                <NotificationDropdown />
                <ModeToggle />
                <UserNav />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
