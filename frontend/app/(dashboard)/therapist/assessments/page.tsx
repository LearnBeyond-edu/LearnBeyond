"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ClipboardList, Sparkles, TrendingUp, BarChart3, Plus, Search } from "lucide-react";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/common/AdminUI";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents } from "@/hooks/useSchool";
import { useTherapists as usePlatformTherapists } from "@/hooks/usePlatform";
import { useInstitutions } from "@/hooks/useInstitutions";
import { average, buildTherapyAssessmentSeed, clampPercent, flattenInfinitePages, getDisplayName, safeReadLocalStorage, safeWriteLocalStorage, type TherapyAssessmentRecord } from "@/lib/therapist";
import { toast } from "sonner";

const ASSESSMENT_KEY = "therapist-assessments";

export default function TherapistAssessmentsPage() {
  const { user } = useAuthStore();
  const { data: therapistData } = usePlatformTherapists();
  const { data: institutionsData } = useInstitutions(50, 0);
  const { data: studentsData, isLoading } = useStudents(100);
  const [activeStatus, setActiveStatus] = useState<"all" | "pending" | "completed">("all");
  const [query, setQuery] = useState("");
  const [assessments, setAssessments] = useState<TherapyAssessmentRecord[]>([]);
  const [draft, setDraft] = useState<Partial<TherapyAssessmentRecord>>({});

  const therapistProfile = useMemo(() => therapistData?.data.find((item) => item.user_id === user?.id) ?? null, [therapistData?.data, user?.id]);
  const institution = useMemo(() => institutionsData?.data.find((item) => item.id === therapistProfile?.institution_id) ?? null, [institutionsData?.data, therapistProfile?.institution_id]);
  const students = useMemo(() => flattenInfinitePages(studentsData).filter((student) => !therapistProfile?.institution_id || student.institution_id === therapistProfile.institution_id), [studentsData, therapistProfile?.institution_id]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;
    
    const saved = localStorage.getItem(ASSESSMENT_KEY);
    if (saved !== null) {
      setAssessments(JSON.parse(saved));
      setIsInitialized(true);
      return;
    }

    if (students.length > 0) {
      const seed = buildTherapyAssessmentSeed(students);
      setAssessments(seed);
      localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(seed));
      setIsInitialized(true);
    }
  }, [students, isInitialized]);

  const deleteAssessment = (id: string) => {
    const next = assessments.filter((item) => item.id !== id);
    setAssessments(next);
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(next));
    toast.success("Assessment removed");
  };

  const filtered = assessments.filter((assessment) => {
    const matchesStatus = activeStatus === "all" || assessment.status === activeStatus;
    const matchesQuery = `${assessment.studentName} ${assessment.type} ${assessment.notes}`.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const metrics = [
    { label: "Pending", value: assessments.filter((item) => item.status === "pending").length },
    { label: "Completed", value: assessments.filter((item) => item.status === "completed").length },
    { label: "Average score", value: average(assessments.map((item) => item.score)) },
  ];

  const saveAssessment = () => {
    if (!draft.studentId || !draft.type) {
      toast.error("Please select a student and assessment type.");
      return;
    }

    const now = new Date().toISOString();
    const student = students.find((item) => item.id === draft.studentId);
    const nextItem: TherapyAssessmentRecord = {
      id: draft.id ?? `assessment-${Date.now()}`,
      studentId: draft.studentId,
      studentName: student ? getDisplayName(student) : draft.studentName ?? "Student",
      type: draft.type,
      status: (draft.status as TherapyAssessmentRecord["status"]) ?? "pending",
      score: clampPercent(Number(draft.score ?? 0)),
      date: draft.date ?? now,
      comparison: draft.comparison ?? "+0% vs baseline",
      notes: draft.notes ?? "",
      chart: draft.chart ?? [48, 55, 61, 68, 74],
    };

    const next = draft.id ? assessments.map((item) => item.id === draft.id ? nextItem : item) : [nextItem, ...assessments];
    setAssessments(next);
    localStorage.setItem(ASSESSMENT_KEY, JSON.stringify(next));
    setDraft({});
    toast.success(draft.id ? "Assessment updated" : "Assessment created");
  };


  if (isLoading) {
    return <TableSkeleton rows={6} cols={4} />;
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Assessments"
        subtitle={institution ? `${institution.name} assessment workspace` : "Therapist assessment workspace"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border/60">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold font-heading">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Assessment History</CardTitle>
            <CardDescription>Learning style, behavior, cognitive, communication, motor, and social assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assessments" className="pl-9" />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "completed"] as const).map((value) => (
                  <Badge key={value} variant={activeStatus === value ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setActiveStatus(value)}>
                    {value}
                  </Badge>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon={<ClipboardList className="h-12 w-12" />} title="No assessments found" description="Create a new assessment or adjust your search filters." />
            ) : filtered.map((assessment) => (
              <motion.div key={assessment.id} whileHover={{ y: -2 }} className="rounded-3xl border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{assessment.studentName}</p>
                      <Badge variant="secondary">{assessment.type}</Badge>
                      <Badge variant={assessment.status === "completed" ? "default" : "outline"}>{assessment.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{assessment.comparison} • {new Date(assessment.date).toLocaleDateString()}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{assessment.notes}</p>
                  </div>
                  <div className="min-w-[120px] rounded-2xl border bg-muted/20 p-3 text-center">
                    <p className="text-3xl font-bold text-teal-600">{assessment.score}%</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Progress score</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {assessment.chart.map((value, index) => <div key={`${assessment.id}-${index}`} className="h-2 flex-1 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-teal-500" style={{ width: `${value}%` }} /></div>)}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDraft(assessment)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteAssessment(assessment.id)} className="text-muted-foreground hover:text-destructive">Delete</Button>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Assessment Builder</CardTitle>
            <CardDescription>Create or update a therapy assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={draft.studentId ?? ""} onValueChange={(value) => setDraft((current) => ({ ...current, studentId: value }))}>
              <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
              <SelectContent>
                {students.map((student) => <SelectItem key={student.id} value={student.id}>{getDisplayName(student)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={draft.type ?? ""} onValueChange={(value) => setDraft((current) => ({ ...current, type: value }))}>
              <SelectTrigger><SelectValue placeholder="Assessment type" /></SelectTrigger>
              <SelectContent>
                {[
                  "Learning Style Assessment",
                  "Behavior Assessment",
                  "Cognitive Assessment",
                  "Communication Assessment",
                  "Motor Skills Assessment",
                  "Social Skills Assessment",
                ].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={draft.status ?? "pending"} onValueChange={(value) => setDraft((current) => ({ ...current, status: value as TherapyAssessmentRecord["status"] }))}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" min={0} max={100} value={draft.score ?? ""} onChange={(event) => setDraft((current) => ({ ...current, score: Number(event.target.value) }))} placeholder="Score" />
            <Input value={draft.comparison ?? ""} onChange={(event) => setDraft((current) => ({ ...current, comparison: event.target.value }))} placeholder="Progress comparison" />
            <Textarea rows={5} value={draft.notes ?? ""} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Assessment notes" />
            <Button className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={saveAssessment}><CheckCircle className="h-4 w-4" /> Save assessment</Button>
            <div className="rounded-2xl border bg-muted/20 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground"><Sparkles className="h-4 w-4 text-teal-500" /> Progress comparison charts</div>
              <div className="mt-3 space-y-2">
                {assessments.slice(0, 5).map((assessment) => (
                  <div key={assessment.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]"><span>{assessment.type}</span><span>{assessment.score}%</span></div>
                    <div className="h-2 rounded-full bg-background overflow-hidden"><div className="h-full rounded-full bg-teal-500" style={{ width: `${assessment.score}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
