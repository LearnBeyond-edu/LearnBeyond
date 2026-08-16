"use client";

import React, { useState } from "react";
import { 
  User, Mail, Phone, MapPin, KeyRound, ShieldCheck, 
  Clock, Link2, PlusCircle, CheckCircle2, BadgeCheck, Camera, Edit3 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";
import { useLearningStore } from "@/store/useLearningStore";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ProfileWorkspace({ userRole }: { userRole: string }) {
  const { user } = useAuthStore();
  const { badges, xp, level } = useLearningStore();

  const [bio, setBio] = useState(
    userRole === "Student" 
      ? "Learning enthusiast trying to master Science and Math."
      : userRole === "Teacher"
        ? "Senior educator specializing in Stem subjects and VAKT curriculum structures."
        : "Clinical consultant dedicated to empowering children with personalized developmental goals."
  );
  
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [address, setAddress] = useState("San Francisco, CA");
  
  const [coverImage, setCoverImage] = useState("");
  const [profileImage, setProfileImage] = useState("");

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { default: api } = await import("@/services/api");
        const res = await api.get('/auth/me');
        const userData = res.data.data.user;
        if (userData.bio !== undefined && userData.bio !== null) setBio(userData.bio);
        if (userData.phone !== undefined && userData.phone !== null) setPhone(userData.phone);
        if (userData.address !== undefined && userData.address !== null) setAddress(userData.address);
        if (userData.cover_image !== undefined && userData.cover_image !== null) setCoverImage(userData.cover_image);
        if (userData.profile_photo !== undefined && userData.profile_photo !== null) setProfileImage(userData.profile_photo);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'profile') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const { default: api } = await import("@/services/api");
          if (type === 'cover') {
            setCoverImage(base64);
            await api.put('/auth/profile', { cover_image: base64 });
          } else {
            setProfileImage(base64);
            await api.put('/auth/profile', { profile_photo: base64 });
          }
          toast.success(`${type === 'cover' ? 'Cover' : 'Profile'} photo updated successfully!`);
        } catch (err) {
          toast.error(`Failed to update ${type} photo.`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Security Form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { default: api } = await import("@/services/api");
      await api.put('/auth/profile', { bio, phone, address });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      const { default: api } = await import("@/services/api");
      await api.post('/auth/change-password', { oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLinkAccount = (provider: string) => {
    toast.success(`Successfully connected with ${provider}!`);
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <div className="space-y-6 text-xs max-w-5xl mx-auto">
      
      {/* Visual Header / Cover banner */}
      <div 
        className="relative h-40 rounded-3xl overflow-hidden bg-gradient-to-r from-teal-600 to-indigo-700 shadow-md bg-cover bg-center"
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : {}}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="absolute bottom-4 right-4">
          <input type="file" id="cover-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
          <label htmlFor="cover-upload">
            <Button asChild variant="secondary" size="sm" className="h-7 text-[10px] rounded-lg gap-1.5 bg-white/20 hover:bg-white/35 text-white border-none backdrop-blur-md cursor-pointer">
              <span><Camera className="h-3.5 w-3.5" /> Edit Cover</span>
            </Button>
          </label>
        </div>
      </div>

      {/* Avatar & Basic Identity Block */}
      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end px-6 -mt-14 relative z-10 pb-2">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl rounded-full bg-card">
            <AvatarImage src={profileImage || ""} className="object-cover" />
            <AvatarFallback className="text-2xl font-extrabold text-teal-600">{initials}</AvatarFallback>
          </Avatar>
          <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full border border-background shadow-md cursor-pointer">
            <Camera className="h-3 w-3" />
          </label>
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold font-heading">
              {user ? `${user.firstName} ${user.lastName}` : "Academic User"}
            </h1>
            <BadgeCheck className="h-4.5 w-4.5 text-teal-600 fill-teal-500/10 shrink-0" />
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5 uppercase tracking-wider">
            <span>{userRole}</span>
            {userRole === "Student" && (
              <>
                <span>•</span>
                <span>Level {level} ({xp} XP)</span>
              </>
            )}
          </p>
        </div>

        <Button 
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
          className={`h-8 gap-1 rounded-xl text-[10px] font-semibold ${isEditing ? "" : "bg-teal-600 hover:bg-teal-700 text-white"}`}
        >
          <Edit3 className="h-3.5 w-3.5" /> {isEditing ? "Cancel Edit" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile info / Bio */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold">Personal Profile & Biography</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-semibold">Biography</label>
                    <textarea 
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                      className="w-full border rounded-xl p-3 bg-background focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold">Contact Phone</label>
                      <Input value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold">Location</label>
                      <Input value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-xs">
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed text-xs">
                    {bio}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3 border-t border-border/40 pt-4">
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Mail className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>{user?.email ?? "user@learnbeyond.com"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>{phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <User className="h-4 w-4 text-teal-600 shrink-0" />
                      <span className="capitalize">{userRole} account context</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unlocked Badges (role-specific/Student context) */}
          {userRole === "Student" && (
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-xs font-bold">Achievement Badges ({badges.filter(b => b.unlocked).length})</CardTitle>
                <CardDescription className="text-[10px]">Your milestones and gamification levels</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
                {badges.map(badge => (
                  <div 
                    key={badge.id} 
                    className={`p-3.5 border rounded-2xl flex gap-3 items-center ${
                      badge.unlocked ? "bg-teal-600/5 border-teal-500/20" : "opacity-50"
                    }`}
                  >
                    <div className="text-2xl">{badge.icon}</div>
                    <div className="min-w-0">
                      <p className="font-bold truncate text-xs">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Credentials */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-teal-600" /> Security Credentials
              </CardTitle>
              <CardDescription className="text-[10px]">Update password records and account credentials</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-semibold">Current Password</label>
                  <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold">New Password</label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold">Confirm New Password</label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" disabled={changingPassword} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9 text-xs">
                  {changingPassword ? "Updating password..." : "Apply Security Update"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Panels: Security logs & connections */}
        <div className="space-y-6">
          
          {/* Activity logs timeline */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-600" /> Account Timeline
              </CardTitle>
              <CardDescription className="text-[10px]">Session logs audit</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4 relative pl-4 border-l border-border/80">
                {[
                  { title: "Logged In Successfully", time: "Today, 10:14 AM", type: "success" },
                  { title: "Settings Profile Changed", time: "Yesterday, 04:30 PM", type: "info" },
                  { title: "IP Location Verification", time: "July 15, 2026", type: "check" }
                ].map((log, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-teal-600 border border-background" />
                    <h5 className="font-bold">{log.title}</h5>
                    <p className="text-[9px] text-muted-foreground">{log.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
