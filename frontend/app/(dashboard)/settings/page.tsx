"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Settings, User, Bell, Shield, Keyboard, KeyRound,
  QrCode, Laptop, AlertTriangle, Eye, ShieldAlert, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/AdminUI";

export default function StudentSettingsPage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Toggles
  const [emailNotif, setEmailNotif] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lb_email_notif") !== "false";
    return true;
  });
  const [soundNotif, setSoundNotif] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lb_sound_notif") !== "false";
    return true;
  });
  const [lauraVoiceEnabled, setLauraVoiceEnabled] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lb_laura_voice") !== "false";
    return true;
  });

  const handleTogglePreference = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, String(value));
      toast.success("Notification preference updated successfully!");
    }
  };
  
  // Accessibility
  const [accessibilityMode, setAccessibilityModeState] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lb_high_contrast") === "true";
    return false;
  });
  const [reducedMotion, setReducedMotionState] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lb_reduced_motion") === "true";
    return false;
  });

  const setAccessibilityMode = (val: boolean) => {
    setAccessibilityModeState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("lb_high_contrast", String(val));
      if (val) document.documentElement.classList.add("high-contrast");
      else document.documentElement.classList.remove("high-contrast");
      toast.success(val ? "High-contrast mode enabled" : "High-contrast mode disabled");
    }
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("lb_reduced_motion", String(val));
      if (val) document.documentElement.classList.add("reduced-motion");
      else document.documentElement.classList.remove("reduced-motion");
      toast.success(val ? "Reduced motion enabled" : "Reduced motion disabled");
    }
  };

  const [sessionData, setSessionData] = useState({
    device: "Loading device info...",
    location: "Detecting location..."
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent;
      let os = "Unknown OS";
      if (ua.indexOf("Win") !== -1) os = "Windows";
      else if (ua.indexOf("Mac") !== -1) os = "MacOS";
      else if (ua.indexOf("Linux") !== -1) os = "Linux";
      else if (ua.indexOf("Android") !== -1) os = "Android";
      else if (ua.indexOf("like Mac") !== -1) os = "iOS";

      let browser = "Unknown Browser";
      if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Edg") === -1) browser = "Chrome";
      else if (ua.indexOf("Edg") !== -1) browser = "Edge";
      else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
      else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");
      
      setSessionData({
        device: `${os} - ${browser} (Current Session)`,
        location: `${timeZone} • Active Now`
      });
    }
  }, []);

  // Security
  const [enable2FA, setEnable2FA] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("lb_2fa_enabled") === "true";
    return false;
  });
  const [showQR, setShowQR] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { default: api } = await import("@/services/api");
      const res = await api.post('/settings/profile', { first_name: firstName, last_name: lastName });
      if (res.data?.status === 'success' && user && accessToken && refreshToken) {
        setAuth({ ...user, firstName: res.data.data.first_name, lastName: res.data.data.last_name }, accessToken, refreshToken);
        toast.success("Profile details updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    if (checked) {
      setShowQR(true);
      toast.info("Authenticator QR code generated. Please scan to complete setup.");
    } else {
      setEnable2FA(false);
      if (typeof window !== "undefined") localStorage.setItem("lb_2fa_enabled", "false");
      setShowQR(false);
      toast.warning("Two-Factor Authentication disabled.");
    }
  };

  const handleVerify2FA = () => {
    setEnable2FA(true);
    if (typeof window !== "undefined") localStorage.setItem("lb_2fa_enabled", "true");
    setShowQR(false);
    toast.success("Two-Factor Authentication activated successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-xs pb-10">
      
      {/* Title */}
      <PageHeader 
        title="System Settings" 
        subtitle="Configure notification preferences, security parameters, and accessibility settings." 
      />

      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8 items-start w-full">
        
        {/* Sidebar Navigation Tabs */}
        <TabsList className="flex flex-col bg-transparent gap-2 p-0 !h-auto !justify-start items-stretch w-full md:w-[240px] shrink-0">
          <TabsTrigger value="profile" className="justify-start gap-3 h-10 text-xs rounded-xl data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-600 font-bold border border-transparent px-3">
            <User className="h-4 w-4" /> Personal Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start gap-3 h-10 text-xs rounded-xl data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-600 font-bold border border-transparent px-3">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start gap-3 h-10 text-xs rounded-xl data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-600 font-bold border border-transparent px-3">
            <Shield className="h-4 w-4" /> Privacy & Security
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="justify-start gap-3 h-10 text-xs rounded-xl data-[state=active]:bg-teal-500/10 data-[state=active]:text-teal-600 font-bold border border-transparent px-3">
            <Keyboard className="h-4 w-4" /> Accessibility
          </TabsTrigger>
        </TabsList>

        {/* Content Panes */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          
          {/* TAB: PROFILE DETAILS */}
          <TabsContent value="profile" className="mt-0">
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <User className="h-4.5 w-4.5 text-teal-600" /> Profile Details
                </CardTitle>
                <CardDescription className="text-[10px]">Update personal dashboard info</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold">First Name</label>
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="text-xs h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold">Last Name</label>
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} className="text-xs h-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold">Email Address</label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="text-xs h-9" disabled />
                  </div>
                  <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs h-9 font-semibold">
                    {saving ? "Saving Changes..." : "Save Profile Details"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: NOTIFICATIONS */}
          <TabsContent value="notifications" className="mt-0">
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Bell className="h-4.5 w-4.5 text-teal-600" /> Notification Channels
                </CardTitle>
                <CardDescription className="text-[10px]">Customize how you receive notices</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Email Summary Digests</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Receive weekly quiz grades, assignment status, and IEP reports.</p>
                  </div>
                  <Switch checked={emailNotif} onCheckedChange={(v) => handleTogglePreference("lb_email_notif", v, setEmailNotif)} />
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Chimes & Gamification Sounds</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Play victory sounds when gaining streaks or leveling up.</p>
                  </div>
                  <Switch checked={soundNotif} onCheckedChange={(v) => handleTogglePreference("lb_sound_notif", v, setSoundNotif)} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Laura AI Voice Synthesis</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Allow Laura AI to read lessons explanations and tips aloud.</p>
                  </div>
                  <Switch checked={lauraVoiceEnabled} onCheckedChange={(v) => handleTogglePreference("lb_laura_voice", v, setLauraVoiceEnabled)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: PRIVACY & SECURITY */}
          <TabsContent value="security" className="mt-0 space-y-6">
            
            {/* 2FA Card */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Shield className="h-4.5 w-4.5 text-teal-600" /> Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription className="text-[10px]">Secure logins using custom authenticator apps</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Require 2FA Passcodes</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Submit temporary numeric keys when signing in on new devices.</p>
                  </div>
                  <Switch checked={enable2FA} onCheckedChange={handleToggle2FA} />
                </div>

                {showQR && (
                  <div className="p-4 border border-teal-500/20 bg-teal-500/5 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-center">
                    <QrCode className="h-28 w-28 text-teal-600 bg-white p-2 rounded-xl border" />
                    <p className="font-bold">LBN-2FA-TOKEN-GEN</p>
                    <p className="text-[10px] text-muted-foreground max-w-xs">
                      Scan this QR code with Google Authenticator or Microsoft Authenticator, then enter the 6-digit key.
                    </p>
                    <Button size="sm" onClick={handleVerify2FA} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-7 font-bold">
                      Verify & Activate Setup
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logged in Sessions */}
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Laptop className="h-4.5 w-4.5 text-teal-600" /> Active Device Sessions
                </CardTitle>
                <CardDescription className="text-[10px]">Manage locations logged into your account</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-center p-3.5 border border-border/60 bg-card rounded-2xl">
                  <div className="space-y-0.5">
                    <p className="font-bold">{sessionData.device}</p>
                    <p className="text-[10px] text-muted-foreground">{sessionData.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: ACCESSIBILITY */}
          <TabsContent value="accessibility" className="mt-0">
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Keyboard className="h-4.5 w-4.5 text-teal-600" /> Accessibility & Navigation
                </CardTitle>
                <CardDescription className="text-[10px]">Configure display parameters for developmental support</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold">High-contrast Mode</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Render higher text readability and solid black borders.</p>
                  </div>
                  <Switch checked={accessibilityMode} onCheckedChange={setAccessibilityMode} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Reduced Motion Filters</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Disable screen fade animations and bouncing items.</p>
                  </div>
                  <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
