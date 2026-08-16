"use client";

import React, { useState } from "react";
import { 
  HelpCircle, BookOpen, MessageSquare, AlertTriangle, Sparkles, 
  ChevronDown, ArrowRight, Play, CheckCircle2, ShieldQuestion 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const faqs: FAQItem[] = [
  { q: "How does Laura AI adapt to my role?", a: "Laura AI reads your authenticated user role context on login. Platform admins can query server metrics, teachers can request curriculum designs, therapists can review clinical notes, parents get family guides, and students get step-by-step tutoring support.", category: "AI Co-pilot" },
  { q: "Where can I download my compiled grades?", a: "Navigate to the Reports page or tab on your dashboard workspace. You can configure filters to compile reports as a PDF document, Excel spreadsheet, or send statements to your email.", category: "Reports" },
  { q: "How do streaks and XP coins work?", a: "Every time you read lessons, complete interactive activities, or pass quizzes, you gain Experience Points (XP) and coins. Use coins inside the Rewards Store on your Analytics page to buy premium UI themes and custom avatars.", category: "Gamification" },
  { q: "Can I join therapy sessions remotely?", a: "Yes, therapeutic lessons scheduled by your clinic therapist contain links. Open the therapist schedule calendar and double-click the speech or sensory session to join the live call.", category: "Therapy" },
];

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [bugType, setBugType] = useState("Bug");
  const [submittingBug, setSubmittingBug] = useState(false);

  const handleSubmitBug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugTitle || !bugDesc) {
      toast.error("Please fill in both title and description.");
      return;
    }
    setSubmittingBug(true);
    setTimeout(() => {
      toast.success(`${bugType} submitted successfully! Our support desk has logged ticket LBN-TK-${Math.floor(Math.random() * 9000 + 1000)}.`);
      setBugTitle("");
      setBugDesc("");
      setSubmittingBug(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-xs">
      
      {/* Title */}
      <div className="flex items-center gap-3 bg-teal-600/5 border border-teal-500/10 p-5 rounded-3xl">
        <div className="p-3 bg-teal-500/10 text-teal-600 rounded-2xl">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-heading">Help Center & Support Desk</h1>
          <p className="text-[10px] text-muted-foreground">Find documentation manuals, watch video tutorials, or file tickets.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        
        {/* FAQs & Documentation */}
        <div className="md:col-span-2 space-y-6">
          
          {/* FAQ Accordions */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <ShieldQuestion className="h-4.5 w-4.5 text-teal-600" /> Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-border/60 rounded-xl overflow-hidden bg-card">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-3.5 flex justify-between items-center hover:bg-muted/10 transition-colors font-bold"
                    >
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-wide text-teal-600 bg-teal-500/5">{faq.category}</Badge>
                        {faq.q}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-185 text-teal-600" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="p-3.5 text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/5">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Tutorials */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-teal-600" /> Quick Video Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-3 sm:grid-cols-2">
              {[
                { title: "Getting Started with LearnBeyond", duration: "3m 45s" },
                { title: "Working with Laura AI co-pilot", duration: "5m 12s" },
              ].map((t, idx) => (
                <div key={idx} className="p-3.5 border border-border/60 rounded-2xl flex items-center justify-between gap-3 bg-card hover:shadow-sm transition-all">
                  <div className="space-y-0.5 min-w-0">
                    <h5 className="font-bold truncate">{t.title}</h5>
                    <p className="text-[10px] text-muted-foreground">Video tutorial • {t.duration}</p>
                  </div>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full text-teal-600 hover:text-teal-700 bg-teal-500/5 shrink-0 border-none">
                    <Play className="h-4 w-4 fill-teal-600" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* Right Side: Report Bugs & Chat Entry */}
        <div className="space-y-6">
          
          {/* Chat with Laura AI */}
          <Card className="border-border/60 bg-teal-600/5">
            <CardHeader>
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-600 animate-pulse" /> Need Immediate Help?
              </CardTitle>
              <CardDescription className="text-[10px]">Chat with Laura AI co-pilot now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Laura AI is trained on all school manuals, curriculum, and diagnostic logs. Get answers to technical questions in real time.
              </p>
              <Link href="/dashboard/laura">
                <Button className="w-full gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl h-9 font-semibold mt-2">
                  Launch Laura AI <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Bug reporting ticket form */}
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-teal-600" /> Support Ticketing Desk
              </CardTitle>
              <CardDescription className="text-[10px]">Report issues or request features</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmitBug} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Ticket Type</label>
                  <div className="flex bg-muted/60 p-0.5 rounded-lg">
                    {["Bug", "Feature Request"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBugType(type)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                          bugType === type ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Title</label>
                  <Input value={bugTitle} onChange={e => setBugTitle(e.target.value)} placeholder="e.g. Page returns error on loading notes" />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Details</label>
                  <textarea
                    value={bugDesc}
                    onChange={e => setBugDesc(e.target.value)}
                    rows={3}
                    className="w-full border rounded-xl p-3 bg-background focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Describe what occurred or features wanted..."
                  />
                </div>

                <Button type="submit" disabled={submittingBug} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9">
                  {submittingBug ? "Logging ticket..." : `Submit ${bugType}`}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
