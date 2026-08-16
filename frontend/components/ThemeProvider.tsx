"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isHighContrast = localStorage.getItem("lb_high_contrast") === "true";
      const isReducedMotion = localStorage.getItem("lb_reduced_motion") === "true";
      
      if (isHighContrast) document.documentElement.classList.add("high-contrast");
      if (isReducedMotion) document.documentElement.classList.add("reduced-motion");
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
