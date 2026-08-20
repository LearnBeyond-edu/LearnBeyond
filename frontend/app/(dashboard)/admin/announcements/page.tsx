"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Megaphone, Pin, Trash2, Eye, Users, GraduationCap, Heart, Brain } from "lucide-react";
import { format } from "date-fns";
import { PageHeader, EmptyState } from "@/components/common/AdminUI";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useAnnouncementStore, type Announcement, type Audience } from "@/store/useAnnouncementStore";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  audience: z.enum(["everyone", "students", "parents", "teachers", "therapists"] as const),
});

type FormValues = z.infer<typeof schema>;

const AUDIENCE_CONFIG: Record<Audience, { label: string; icon: React.ElementType; color: string }> = {
  everyone: { label: "Everyone", icon: Megaphone, color: "bg-primary/10 text-primary" },
  students: { label: "Students", icon: GraduationCap, color: "bg-green-500/10 text-green-600" },
  parents: { label: "Parents", icon: Heart, color: "bg-pink-500/10 text-pink-600" },
  teachers: { label: "Teachers", icon: Users, color: "bg-violet-500/10 text-violet-600" },
  therapists: { label: "Therapists", icon: Brain, color: "bg-orange-500/10 text-orange-600" },
};

export default function AdminAnnouncementsPage() {
  const { announcements, addAnnouncement, togglePin, deleteAnnouncement } = useAnnouncementStore();
  const [showCreate, setShowCreate] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", message: "", audience: "everyone" },
  });

  function onCreate(values: FormValues) {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: values.title,
      message: values.message,
      audience: values.audience,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    addAnnouncement(newAnnouncement);
    form.reset();
    setShowCreate(false);
  }

  const pinned = announcements.filter((a) => a.pinned);
  const unpinned = announcements.filter((a) => !a.pinned);

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="Platform Announcements"
        subtitle={`${announcements.length} announcement${announcements.length !== 1 ? "s" : ""} broadcasted across the platform`}
        actions={
          <Button onClick={() => setShowCreate(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        }
      />

      {announcements.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-14 w-14" />} title="No announcements" description="Create your first global announcement to communicate with users." action={<Button onClick={() => setShowCreate(true)}>Create Announcement</Button>} />
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Pin className="h-3.5 w-3.5" /> Pinned</p>
              <div className="space-y-3">
                <AnimatePresence>
                  {pinned.map((a) => <AnnouncementCard key={a.id} announcement={a} onPin={togglePin} onDelete={deleteAnnouncement} />)}
                </AnimatePresence>
              </div>
            </div>
          )}

          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent</p>}
              <div className="space-y-3">
                <AnimatePresence>
                  {unpinned.map((a) => <AnnouncementCard key={a.id} announcement={a} onPin={togglePin} onDelete={deleteAnnouncement} />)}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Global Announcement</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4 mt-2">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Announcement title..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="message" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl><Textarea placeholder="Write your announcement..." rows={4} className="resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="audience" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(Object.keys(AUDIENCE_CONFIG) as Audience[]).map((key) => {
                      const { label, icon: Icon, color } = AUDIENCE_CONFIG[key];
                      const isSelected = field.value === key;
                      return (
                        <button key={key} type="button" onClick={() => field.onChange(key)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                          <div className={`p-1.5 rounded-lg ${isSelected ? color : "bg-muted"}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit">Publish</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementCard({ announcement, onPin, onDelete }: {
  announcement: Announcement;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { label, icon: Icon, color } = AUDIENCE_CONFIG[announcement.audience];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className={`${announcement.pinned ? "border-primary/40" : ""}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${color}`}><Icon className="h-4 w-4" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-semibold">{announcement.title}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onPin(announcement.id)} title={announcement.pinned ? "Unpin" : "Pin"}
                    className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors ${announcement.pinned ? "text-primary" : ""}`}>
                    <Pin className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete(announcement.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{announcement.message}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(announcement.createdAt), "MMM d, yyyy · h:mm a")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
