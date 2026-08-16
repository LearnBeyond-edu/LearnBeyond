"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, BookOpen, FileText, Settings, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useClasses, useLessons } from "@/hooks/useSchool";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
  title: string;
  category: "Lessons" | "Reports" | "AI" | "Settings" | "Common";
  url: string;
  description: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { user } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set up base path for redirecting
  const getBasePath = () => {
    if (user?.role === "Parent") return "/parent";
    if (user?.role === "Teacher") return "/teacher";
    if (user?.role === "Therapist") return "/therapist";
    if (user?.role === "Institution Admin") return "/school";
    if (user?.role === "Platform Admin") return "/admin";
    return "";
  };

  const basePath = getBasePath();

  const { data: clsData } = useClasses(20);
  const { data: lesData } = useLessons(20);
  
  const classes = clsData?.pages?.flatMap(p => p.data) ?? [];
  const lessons = lesData?.pages?.flatMap(p => p.data) ?? [];

  const searchItems: SearchItem[] = [
    ...classes.map(c => ({
      title: c.name || `Class ${c.grade} - Section ${c.section}`,
      category: "Lessons" as const,
      url: `/classes`,
      description: c.description || "Active enrolled curriculum module."
    })),
    ...lessons.map(l => ({
      title: l.title,
      category: "Lessons" as const,
      url: `/lessons/${l.id}`,
      description: l.description || "Interactive syllabus lesson."
    })),
    { title: "Academic Reporting", category: "Reports", url: basePath ? `${basePath}/reports` : "/analytics", description: "Compile academic performance scores." },
    { title: "Laura AI Assistant", category: "AI", url: basePath ? `${basePath}/laura` : "/dashboard/laura", description: "Co-pilot chat & generative learning assistance." },
    { title: "Security & Configuration", category: "Settings", url: `${basePath}/settings`, description: "Update passwords & connected session tokens." },
  ];

  // Filter list
  const filtered = searchItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  // Toggle Command Bar with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keyboard navigation inside list
  useEffect(() => {
    if (!isOpen) return;
    const handleNavigation = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          handleSelect(filtered[selectedIndex]);
        }
      }
    };
    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filtered, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: SearchItem) => {
    router.push(item.url);
    setIsOpen(false);
    setQuery("");
  };

  const getCategoryIcon = (cat: SearchItem["category"]) => {
    switch (cat) {
      case "Lessons": return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "Reports": return <FileText className="h-4 w-4 text-emerald-500" />;
      case "AI": return <Sparkles className="h-4 w-4 text-purple-500" />;
      case "Settings": return <Settings className="h-4 w-4 text-indigo-500" />;
      default: return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      {/* Trigger button inside TopNav */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-3 px-3 py-1.5 border border-border/60 bg-muted/30 hover:bg-muted/50 transition-all rounded-xl text-xs w-44 md:w-56 text-muted-foreground text-left focus:outline-none"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" /> Search...
        </span>
        <span className="text-[10px] bg-muted border font-semibold px-1.5 py-0.5 rounded text-muted-foreground">
          ⌘K
        </span>
      </button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              ref={modalRef}
              className="bg-card border border-border/80 shadow-2xl rounded-3xl w-full max-w-xl overflow-hidden text-xs"
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/60">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  type="text"
                  placeholder="Search classes, lessons, report sheets..."
                  className="w-full bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] bg-muted border px-2 py-0.5 rounded-lg text-muted-foreground"
                >
                  ESC
                </button>
              </div>

              {/* Suggestions results list */}
              <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
                {filtered.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">No matches found for "{query}"</div>
                ) : (
                  filtered.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                        selectedIndex === idx ? "bg-muted/60" : "hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2 bg-muted rounded-lg shrink-0">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="font-bold text-foreground flex items-center gap-2">
                            {item.title}
                            <span className="text-[9px] uppercase px-1.5 py-0.2 bg-secondary rounded text-secondary-foreground font-semibold">
                              {item.category}
                            </span>
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                        selectedIndex === idx ? "translate-x-1 text-teal-600" : ""
                      }`} />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
