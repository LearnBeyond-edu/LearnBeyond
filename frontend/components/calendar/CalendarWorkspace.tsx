"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, 
  MapPin, PlusCircle, Search, Filter, Layers, ListTodo, AlertTriangle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek,
  addWeeks, subWeeks, eachDayOfInterval as eachDay, startOfDay, addDays, subDays
} from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLessons } from "@/hooks/useSchool";

export interface CalendarEvent {
  id: string;
  title: string;
  type: "class" | "assignment" | "exam" | "therapy" | "holiday" | "meeting";
  date: Date;
  time: string;
  location?: string;
  description?: string;
}

const initialEvents: CalendarEvent[] = [];

export function CalendarWorkspace({ userRole }: { userRole: string }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "agenda">("month");
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  
  const { data: lessonsData } = useLessons(100);
  
  React.useEffect(() => {
    const lessons = lessonsData?.pages.flatMap((p) => p?.data || []) ?? [];
    if (lessons.length > 0) {
      const backendEvents: CalendarEvent[] = lessons.filter((l) => l.scheduled_time).map((l) => {
        const dateObj = new Date(l.scheduled_time!);
        return {
          id: l.id,
          title: l.title,
          type: "class",
          date: dateObj,
          time: format(dateObj, "hh:mm a"),
          description: l.description || "",
        };
      });
      // Merge unique events
      setEvents((prev) => {
        const manualEvents = prev.filter((p) => !backendEvents.some((be) => be.id === p.id));
        return [...manualEvents, ...backendEvents];
      });
    }
  }, [lessonsData]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("09:00 AM");
  const [newEventType, setNewEventType] = useState<CalendarEvent["type"]>("class");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Month navigation helpers
  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  // Generate days based on current view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(e => isSameDay(e.date, date) && 
      (typeFilter === "all" || e.type === typeFilter) &&
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleAddEvent = () => {
    if (!newEventTitle) {
      toast.error("Please add a title for your event.");
      return;
    }
    const created: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle,
      type: newEventType,
      date: selectedDate,
      time: newEventTime,
      location: newEventLocation || undefined,
      description: newEventDesc || undefined
    };
    setEvents(prev => [...prev, created]);
    setNewEventTitle("");
    setNewEventLocation("");
    setNewEventDesc("");
    setIsCreateOpen(false);
    toast.success("Event added to calendar!");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        toast.info(`Moved "${evt.title}" to ${format(targetDate, "MMM d, yyyy")}`);
        return { ...evt, date: targetDate };
      }
      return evt;
    }));
  };

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("text/plain", eventId);
  };

  const getEventBadgeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "class": return "bg-blue-500/10 text-blue-600 border-none font-bold";
      case "assignment": return "bg-purple-500/10 text-purple-600 border-none font-bold";
      case "exam": return "bg-red-500/10 text-red-600 border-none font-bold";
      case "therapy": return "bg-teal-500/10 text-teal-600 border-none font-bold";
      case "holiday": return "bg-amber-500/10 text-amber-600 border-none font-bold";
      case "meeting": return "bg-slate-500/10 text-slate-600 border-none font-bold";
    }
  };

  const activeEvents = viewMode === "day" 
    ? getEventsForDay(currentDate) 
    : getEventsForDay(selectedDate);

  return (
    <div className="space-y-5 text-xs">
      
      {/* Calendar Header Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/60 p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 text-teal-600 rounded-xl">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-heading">
              {format(currentDate, viewMode === "month" ? "MMMM yyyy" : viewMode === "week" ? "'Week of' MMM d, yyyy" : "PPP")}
            </h2>
            <p className="text-[10px] text-muted-foreground">Manage schedules and events</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Modes */}
          <div className="flex bg-muted/60 p-0.5 rounded-lg">
            {(["month", "week", "day", "agenda"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
                  viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Prev/Next */}
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Event Trigger */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button className="h-8 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-semibold">
                  <PlusCircle className="h-3.5 w-3.5" /> Add Event
                </Button>
              }
            />
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">Create New Calendar Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold">Event Title</label>
                  <Input value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="e.g. Speech Articulation check-up" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold">Event Category</label>
                    <Select value={newEventType} onValueChange={(val: any) => setNewEventType(val)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class" className="text-xs">Class Lesson</SelectItem>
                        <SelectItem value="assignment" className="text-xs">Assignment Due Date</SelectItem>
                        <SelectItem value="exam" className="text-xs">Quiz or Exam</SelectItem>
                        <SelectItem value="therapy" className="text-xs">Therapy Session</SelectItem>
                        <SelectItem value="holiday" className="text-xs">Holiday Event</SelectItem>
                        <SelectItem value="meeting" className="text-xs">Staff/Parent Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold">Time Slot</label>
                    <Input value={newEventTime} onChange={e => setNewEventTime(e.target.value)} placeholder="e.g. 10:00 AM - 11:30 AM" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Location / Link</label>
                  <Input value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} placeholder="e.g. Room 102 or Zoom link" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Description</label>
                  <textarea 
                    value={newEventDesc} 
                    onChange={e => setNewEventDesc(e.target.value)} 
                    rows={3} 
                    className="w-full border rounded-xl p-3 bg-background focus:outline-none focus:ring-1 focus:ring-teal-500" 
                    placeholder="Provide additional details..." 
                  />
                </div>
                <Button onClick={handleAddEvent} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-9">
                  Create Event Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main layout grid */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Left Side Calendar Panels */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Quick Filters */}
          <div className="flex gap-2 items-center bg-card border border-border/60 p-3 rounded-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search event title..." 
                className="pl-9 h-8 text-[11px] rounded-lg" 
              />
            </div>
          </div>

          {/* Render Calendar Views */}
          <Card className="border-border/60">
            <CardContent className="p-4">
              
              {/* MONTH VIEW */}
              {viewMode === "month" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 text-center font-bold text-muted-foreground pb-2 border-b">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.map((day, idx) => {
                      const dayEvents = getEventsForDay(day);
                      const isSelected = isSameDay(day, selectedDate);
                      const isCurrMonth = isSameMonth(day, currentDate);
                      const isTodayDate = isSameDay(day, new Date());

                      return (
                        <div
                          key={idx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day)}
                          onClick={() => setSelectedDate(day)}
                          className={`min-h-[70px] p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:bg-muted/30 ${
                            isSelected 
                              ? "border-teal-500 bg-teal-500/5" 
                              : isTodayDate
                                ? "border-indigo-500/50 bg-indigo-500/5"
                                : isCurrMonth 
                                  ? "bg-card border-border/60" 
                                  : "bg-muted/10 border-transparent text-muted-foreground"
                          }`}
                        >
                          <span className={`self-start h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                            isTodayDate ? "bg-indigo-600 text-white" : ""
                          }`}>
                            {format(day, "d")}
                          </span>
                          <div className="space-y-0.5 mt-1 overflow-hidden">
                            {dayEvents.slice(0, 2).map(e => (
                              <div
                                key={e.id}
                                draggable
                                onDragStart={(evt) => handleDragStart(evt, e.id)}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-semibold truncate border ${getEventBadgeColor(e.type)}`}
                              >
                                {e.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <p className="text-[8px] text-muted-foreground text-center font-bold">+{dayEvents.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEK VIEW */}
              {viewMode === "week" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 text-center font-bold text-muted-foreground pb-2 border-b">
                    {daysInWeek.map((day, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span>{format(day, "EEE")}</span>
                        <span className={`h-5 w-5 flex items-center justify-center rounded-full text-[10px] mt-0.5 ${
                          isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : ""
                        }`}>{format(day, "d")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 min-h-[260px]">
                    {daysInWeek.map((day, idx) => {
                      const dayEvents = getEventsForDay(day);
                      return (
                        <div
                          key={idx}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day)}
                          onClick={() => setSelectedDate(day)}
                          className={`p-2 rounded-2xl border bg-muted/10 border-border/40 space-y-2 ${
                            isSameDay(day, selectedDate) ? "ring-1 ring-teal-500 bg-teal-500/5" : ""
                          }`}
                        >
                          {dayEvents.length === 0 ? (
                            <p className="text-[9px] text-muted-foreground text-center pt-8 italic">No events</p>
                          ) : (
                            <div className="space-y-1.5">
                              {dayEvents.map(e => (
                                <div
                                  key={e.id}
                                  draggable
                                  onDragStart={(evt) => handleDragStart(evt, e.id)}
                                  className={`p-1.5 rounded-xl border flex flex-col gap-0.5 cursor-grab active:cursor-grabbing ${getEventBadgeColor(e.type)}`}
                                >
                                  <span className="font-bold text-[9px] truncate leading-tight">{e.title}</span>
                                  <span className="text-[8px] opacity-80">{e.time}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DAY VIEW */}
              {viewMode === "day" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded-xl border">
                    <p className="font-semibold text-muted-foreground">Detailed view for today:</p>
                    <Badge variant="outline" className="font-bold text-teal-600 bg-teal-500/5">{format(currentDate, "PP")}</Badge>
                  </div>
                  <div className="space-y-2.5 min-h-[220px]">
                    {getEventsForDay(currentDate).length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">No events scheduled for today.</div>
                    ) : (
                      getEventsForDay(currentDate).map(e => (
                        <div key={e.id} className={`p-4 border rounded-2xl flex items-center justify-between gap-4 ${getEventBadgeColor(e.type)}`}>
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase font-bold tracking-wide opacity-80">{e.type}</span>
                            <h4 className="font-extrabold text-sm text-foreground">{e.title}</h4>
                            <div className="flex items-center gap-3 text-[10px] opacity-90">
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {e.time}</span>
                              {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>}
                            </div>
                            {e.description && <p className="text-[10px] opacity-80 max-w-lg mt-1 border-t pt-1 border-dashed border-foreground/10">{e.description}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* AGENDA VIEW */}
              {viewMode === "agenda" && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs">Upcoming Schedule agenda</h3>
                  <div className="divide-y max-h-[350px] overflow-y-auto pr-1">
                    {events.length === 0 ? (
                      <p className="text-center py-10 text-muted-foreground">Your calendar agenda is completely clear.</p>
                    ) : (
                      events
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map(e => (
                          <div key={e.id} className="py-3 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-xl text-center shrink-0 min-w-[50px]">
                                <span className="block font-bold text-xs">{format(e.date, "d")}</span>
                                <span className="block text-[8px] uppercase tracking-wide text-muted-foreground">{format(e.date, "MMM")}</span>
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-xs">{e.title}</h4>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.time}</span>
                                  {e.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>}
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getEventBadgeColor(e.type)} px-2 py-0.5 rounded-full capitalize`}>{e.type}</Badge>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Side Selected Event Details */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <ListTodo className="h-4 w-4 text-teal-600" />
                {format(selectedDate, "PPP")}
              </CardTitle>
              <CardDescription className="text-[10px]">Agenda for chosen day</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {getEventsForDay(selectedDate).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center">
                  <CalendarIcon className="h-8 w-8 mb-2 opacity-40 text-muted-foreground" />
                  <p className="font-semibold">No Scheduled Events</p>
                  <p className="text-[10px] mt-0.5">Drag an event here or click 'Add Event' above to insert items.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getEventsForDay(selectedDate).map(e => (
                    <motion.div
                      key={e.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-3.5 border rounded-2xl flex flex-col gap-2 bg-card hover:shadow-sm transition-all border-l-4 ${
                        e.type === "class" 
                          ? "border-l-blue-500" 
                          : e.type === "assignment" 
                            ? "border-l-purple-500" 
                            : e.type === "exam" 
                              ? "border-l-red-500" 
                              : e.type === "therapy" 
                                ? "border-l-teal-500" 
                                : "border-l-amber-500"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-xs">{e.title}</h4>
                        <Badge className={`${getEventBadgeColor(e.type)} rounded text-[8px] px-1.5 py-0.2 capitalize`}>
                          {e.type}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-[10px] text-muted-foreground">
                        <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {e.time}</p>
                        {e.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.location}</p>}
                        {e.description && (
                          <p className="border-t border-dashed pt-1.5 mt-1.5 text-[9px] leading-relaxed">
                            {e.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
