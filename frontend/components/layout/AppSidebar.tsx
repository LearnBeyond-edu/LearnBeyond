"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  Users,
  BookOpen,
  BarChart,
  LogOut,
  Sparkles,
  Calendar,
  FileText,
  CheckSquare,
  User,
  HeartPulse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

// Placeholder navigation data
const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Classes", url: "/classes", icon: Users },
  { title: "Lessons", url: "/lessons", icon: BookOpen },
  { title: "Assignments", url: "/assignments", icon: FileText },
  { title: "Quizzes", url: "/quizzes", icon: CheckSquare },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Therapy Room", url: "/therapy", icon: HeartPulse },
  { title: "Analytics", url: "/analytics", icon: BarChart },
  { title: "Laura AI", url: "/dashboard/laura", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Profile", url: "/student/profile", icon: User },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4">
        <h1 className="text-xl font-bold font-heading">LearnBeyond</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.url)}
                    render={<Link href={item.url} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
