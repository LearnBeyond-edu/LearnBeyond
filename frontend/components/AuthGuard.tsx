"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useLearningStore } from "@/store/useLearningStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const { rewards } = useLearningStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const hasNeonTheme = rewards.find(r => r.id === 'rew-1')?.unlocked;

  useEffect(() => {
    // Wait for Zustand persist middleware to hydrate from localStorage
    setIsHydrated(useAuthStore.persist.hasHydrated());
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return; // Don't make routing decisions until we know the true auth state

    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
    } else {
      setIsChecking(false);
    }
  }, [isHydrated, isAuthenticated, user, router, pathname, allowedRoles]);

  if (!isHydrated || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {hasNeonTheme && (
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            background-image: linear-gradient(rgba(45, 212, 191, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(45, 212, 191, 0.05) 1px, transparent 1px) !important;
            background-size: 30px 30px !important;
          }
          .bg-card {
            box-shadow: 0 0 15px rgba(45, 212, 191, 0.1) !important;
            border-color: rgba(45, 212, 191, 0.3) !important;
          }
          h1, h2, h3 {
            text-shadow: 0 0 10px rgba(45, 212, 191, 0.3);
          }
        `}} />
      )}
      {children}
    </>
  );
}
