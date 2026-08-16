"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNav } from "@/components/layout/TopNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/AuthGuard";

import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // List of root paths that provide their own layouts
  const customLayoutRoots = ['/admin', '/school', '/teacher', '/parent', '/therapist'];
  const hasCustomLayout = customLayoutRoots.some(root => pathname?.startsWith(root));

  if (hasCustomLayout) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <TopNav />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
