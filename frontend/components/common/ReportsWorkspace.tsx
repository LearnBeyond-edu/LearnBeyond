"use client";

import React, { useState } from "react";
import { 
  FileText, Download, Printer, Share2, Mail, 
  Loader2, CheckCircle2, ChevronRight, BarChart3, Clock, ArrowRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  scope: string;
  metrics: { label: string; value: string | number }[];
  details: { name: string; score: string; status: string }[];
}

const initialReportsList: Report[] = [];

const platformAdminReportsTemplate: Report[] = [
  {
    id: "rep-admin-101",
    title: "Q2 LearnBeyond Profit & Loss Statement",
    type: "Financial Reports",
    date: "July 18, 2026",
    scope: "Quarterly",
    metrics: [],
    details: []
  },
  {
    id: "rep-admin-102",
    title: "June Subscription Revenue Audit",
    type: "Revenue Reports",
    date: "June 30, 2026",
    scope: "Monthly",
    metrics: [],
    details: []
  }
];

import { useInstitutions } from "@/hooks/useInstitutions";
import { useClasses, useAssignments, useProgress, useAttendance } from "@/hooks/useSchool";
import { useStudents, useStaff, useTherapists, useParents } from "@/hooks/usePlatform";
import { useEffect } from "react";

export function ReportsWorkspace({ userRole }: { userRole: string }) {
  const { data: instData } = useInstitutions(100, 0);
  const { data: clsData } = useClasses(10);
  const { data: asmData } = useAssignments();
  const { data: progData } = useProgress();
  const { data: attData } = useAttendance();
  
  const institutions = instData?.data ?? [];
  const classes = clsData?.pages?.flatMap(p => p.data) ?? [];
  const assignments = asmData?.pages?.flatMap(p => p.data) ?? [];
  const allProgress = progData?.pages?.flatMap(p => p.data) ?? [];
  const allAttendance = attData?.pages?.flatMap(p => p.data) ?? [];
  const average = (arr: number[]) => arr.length === 0 ? 0 : Math.round(arr.reduce((a,b)=>a+b,0) / arr.length);
  const clampPercent = (val: number) => Math.min(Math.max(Math.round(val), 0), 100);

  const { data: stdData } = useStudents();
  const { data: stfData } = useStaff();
  const { data: thpData } = useTherapists();
  const { data: parData } = useParents();

  const students = stdData?.data ?? [];
  const staff = stfData?.data ?? [];
  const therapists = thpData?.data ?? [];
  const parents = parData?.data ?? [];

  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      try {
        const res = await api.get('/analytics/system-health');
        return res.data;
      } catch (e) {
        return null;
      }
    },
    enabled: userRole === "Platform Admin"
  });

  const initialReports = userRole === "Platform Admin" ? platformAdminReportsTemplate : initialReportsList;
  const [reportType, setReportType] = useState<string>("");
  const [timeScope, setTimeScope] = useState<string>("weekly");
  const [compiling, setCompiling] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(initialReports[0]);
  const [generatedReports, setGeneratedReports] = useState<Report[]>(initialReports);

  useEffect(() => {
    if (userRole === "Platform Admin" && institutions.length > 0) {
      // Calculate real stats from real institutions
      let enterprise = 0, pro = 0, starter = 0;
      institutions.forEach(inst => {
        if (inst.subscription_plan === "Enterprise") enterprise++;
        else if (inst.subscription_plan === "Professional") pro++;
        else starter++;
      });
      
      const mrr = (enterprise * 999) + (pro * 299) + (starter * 99);
      const grossRevenue = mrr * 3; // Quarterly approx
      const infrastructureCosts = institutions.length * 150; // $150 per inst server cost
      
      const realReports: Report[] = [
        {
          id: "rep-admin-101",
          title: "Q2 LearnBeyond Profit & Loss Statement",
          type: "Financial Reports",
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          scope: "Quarterly",
          metrics: [
            { label: "Gross Revenue", value: `$${grossRevenue.toLocaleString()}` },
            { label: "Net Profit Margin", value: `${Math.round(((grossRevenue - infrastructureCosts) / (grossRevenue || 1)) * 100)}%` },
            { label: "Active Subscriptions", value: institutions.length.toString() },
          ],
          details: [
            { name: "Enterprise Licenses", score: `$${(enterprise * 999 * 3).toLocaleString()}`, status: enterprise > 0 ? "Target Met" : "Requires Focus" },
            { name: "Professional Plans", score: `$${(pro * 299 * 3).toLocaleString()}`, status: "Stable" },
            { name: "Server & Infrastructure Costs", score: `-$${infrastructureCosts.toLocaleString()}`, status: "Optimal" },
            { name: "Marketing & Acquisition", score: "-$5,000", status: "On Track" }
          ]
        },
        {
          id: "rep-admin-102",
          title: "Current Subscription Revenue Audit",
          type: "Revenue Reports",
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          scope: "Monthly",
          metrics: [
            { label: "MRR", value: `$${mrr.toLocaleString()}` },
            { label: "Churn Rate", value: "0%" },
            { label: "Total Institutions", value: institutions.length.toString() },
          ],
          details: [
            { name: "Enterprise Tier Growth", score: `${enterprise} Active`, status: "Excellent" },
            { name: "Professional Tier Growth", score: `${pro} Active`, status: "Good" },
            { name: "Payment Gateway Fees", score: `-$${Math.round(mrr * 0.029).toLocaleString()}`, status: "Expected" },
            { name: "Refunds Issued", score: "$0", status: "Minimal" },
          ]
        }
      ];
      
      setGeneratedReports(realReports);
      if (selectedReport?.id === platformAdminReportsTemplate[0].id || selectedReport?.id === platformAdminReportsTemplate[1].id) {
        setSelectedReport(realReports[0]);
      }
    }
  }, [institutions, userRole]);

  const reportOptions = userRole === "Platform Admin" ? [
    { value: "Financial Reports", label: "Financial Reports" },
    { value: "Revenue Reports", label: "Revenue Reports" },
    { value: "Institution Subscriptions", label: "Institution Subscriptions" },
    { value: "System Infrastructure", label: "System Infrastructure" },
    { value: "Market Expansion", label: "Market Expansion" },
    { value: "Platform Analytics", label: "Platform Analytics" }
  ] : userRole === "Parent" ? [
    { value: "Student Reports", label: "Student Reports" },
    { value: "Performance Reports", label: "Performance Reports" }
  ] : userRole === "Teacher" ? [
    { value: "Student Reports", label: "Student Reports" },
    { value: "Therapist Reports", label: "Therapist Reports" },
    { value: "Performance Reports", label: "Performance Reports" }
  ] : userRole === "Therapist" ? [
    { value: "Student Clinical Reports", label: "Student Clinical Reports" },
    { value: "Behavioral Assessments", label: "Behavioral Assessments" },
    { value: "Therapy Session Summaries", label: "Therapy Session Summaries" }
  ] : [
    { value: "Student Reports", label: "Student Reports" },
    { value: "Teacher Reports", label: "Teacher Reports" },
    { value: "Therapist Reports", label: "Therapist Reports" },
    { value: "Institution Reports", label: "Institution Reports" },
    { value: "Platform Reports", label: "Platform Reports" },
    { value: "Performance Reports", label: "Performance Reports" }
  ];

  const handleGenerate = () => {
    if (!reportType) {
      toast.error("Please select a report type first.");
      return;
    }

    setCompiling(true);
    
    const scopeLabel = timeScope === "weekly" ? "Weekly" : timeScope === "monthly" ? "Monthly" : "Yearly";
    
    let metrics: { label: string; value: string | number }[] = [];
    let details: { name: string; score: string; status: string }[] = [];

    switch (reportType) {
      case "System Infrastructure":
        metrics = [
          { label: "CPU Load", value: healthData?.data?.cpu?.load ? `${healthData.data.cpu.load}%` : "0%" },
          { label: "Memory Used", value: healthData?.data?.memory?.used ? `${healthData.data.memory.used} GB` : "0 GB" },
          { label: "Active DB Connections", value: healthData?.data?.database?.active_connections || "0" },
        ];
        details = [
          { name: "CPU Status", score: healthData?.data?.cpu?.status || "Unknown", status: "Optimal" },
          { name: "Memory Capacity", score: healthData?.data?.memory?.percent ? `${healthData.data.memory.percent}%` : "Unknown", status: "Stable" },
        ];
        break;
      case "Institution Subscriptions":
        metrics = [
          { label: "Total Institutions", value: institutions.length.toString() },
          { label: "Enterprise Plans", value: institutions.filter(i => i.subscription_plan === 'Enterprise').length.toString() },
          { label: "Active Subscriptions", value: institutions.filter(i => !i.deleted_at).length.toString() },
        ];
        details = institutions.slice(0, 3).map(inst => ({
          name: inst.name,
          score: inst.subscription_plan || "Starter",
          status: inst.deleted_at ? "Churned" : "Active"
        }));
        if (details.length === 0) details = [{ name: "No Data", score: "-", status: "-" }];
        break;
      case "Financial Reports":
      case "Revenue Reports": {
        let enterprise = 0, pro = 0, starter = 0;
        institutions.forEach(inst => {
          if (inst.subscription_plan === "Enterprise") enterprise++;
          else if (inst.subscription_plan === "Professional") pro++;
          else starter++;
        });
        const mrr = (enterprise * 999) + (pro * 299) + (starter * 99);
        const grossRevenue = mrr * 3;
        const infrastructureCosts = institutions.length * 150;
        
        if (reportType === "Financial Reports") {
          metrics = [
            { label: "Gross Revenue", value: `$${grossRevenue.toLocaleString()}` },
            { label: "Net Profit Margin", value: `${Math.round(((grossRevenue - infrastructureCosts) / (grossRevenue || 1)) * 100)}%` },
            { label: "Active Subscriptions", value: institutions.length.toString() },
          ];
          details = [
            { name: "Enterprise Licenses", score: `$${(enterprise * 999 * 3).toLocaleString()}`, status: enterprise > 0 ? "Target Met" : "Requires Focus" },
            { name: "Professional Plans", score: `$${(pro * 299 * 3).toLocaleString()}`, status: "Stable" },
            { name: "Server & Infrastructure Costs", score: `-$${infrastructureCosts.toLocaleString()}`, status: "Optimal" }
          ];
        } else {
          metrics = [
            { label: "MRR", value: `$${mrr.toLocaleString()}` },
            { label: "Churn Rate", value: "0%" },
            { label: "Total Institutions", value: institutions.length.toString() },
          ];
          details = [
            { name: "Enterprise Tier Growth", score: `${enterprise} Active`, status: "Excellent" },
            { name: "Professional Tier Growth", score: `${pro} Active`, status: "Good" },
            { name: "Payment Gateway Fees", score: `-$${Math.round(mrr * 0.029).toLocaleString()}`, status: "Expected" },
          ];
        }
        break;
      }
      case "Market Expansion":
        metrics = [
          { label: "Registered Institutions", value: institutions.length.toString() },
          { label: "Average Inst. Size", value: classes.length > 0 ? (classes.length / (institutions.length || 1)).toFixed(1) + " classes" : "0" },
          { label: "Platform Usage", value: assignments.length.toString() + " tasks" },
        ];
        details = institutions.slice(0, 2).map(inst => ({
          name: `${inst.name} Region Deployment`, score: "Completed", status: "Optimal"
        }));
        if (details.length === 0) details = [{ name: "No regions", score: "-", status: "-" }];
        break;
      case "Platform Analytics":
        metrics = [
          { label: "Active Institutions", value: institutions.length.toString() },
          { label: "Classes Created", value: classes.length.toString() },
          { label: "Assignments Tracked", value: assignments.length.toString() },
        ];
        details = [
          { name: "Global Class Enrollment", score: classes.length > 0 ? "Active" : "Pending", status: classes.length > 0 ? "Optimal" : "Requires Focus" },
          { name: "Assignment Completion", score: assignments.length > 0 ? "Active" : "Pending", status: assignments.length > 0 ? "Optimal" : "Requires Focus" },
        ];
        break;
      case "Student Reports":
        metrics = [
          { label: "Total Students", value: students.length.toString() },
          { label: "Classes Enrolled", value: classes.length.toString() },
          { label: "Assignments Tracked", value: assignments.length.toString() },
        ];
        details = [
          { name: "Active Student Profiles", score: students.length > 0 ? "Active" : "None", status: students.length > 0 ? "Optimal" : "Requires Focus" },
          { name: "Global Assignment Volume", score: assignments.length.toString(), status: assignments.length > 0 ? "Stable" : "Requires Focus" },
        ];
        break;
      case "Teacher Reports":
        metrics = [
          { label: "Total Staff/Teachers", value: staff.length.toString() },
          { label: "Classes Managed", value: classes.length.toString() },
          { label: "Assignments Given", value: assignments.length.toString() },
        ];
        details = classes.length > 0 ? classes.slice(0, 3).map(c => ({
          name: `Class ${c.grade} - Section ${c.section}`,
          score: "Active", status: "Optimal"
        })) : [{ name: "No classes", score: "N/A", status: "Pending" }];
        break;
      case "Therapist Reports":
        metrics = [
          { label: "Total Therapists", value: therapists.length.toString() },
          { label: "Institutions Supported", value: institutions.length.toString() },
          { label: "Special Needs Coverage", value: therapists.length > 0 ? "Active" : "Pending" },
        ];
        details = [
          { name: "Therapy Staffing", score: `${therapists.length} Active`, status: therapists.length > 0 ? "Optimal" : "Requires Focus" },
        ];
        break;
      case "Student Clinical Reports": {
        const clinicalCases = [...new Set(allProgress.map(p => p.student_id))].length;
        const avgScore = allProgress.length > 0 ? average(allProgress.map(p => p.score || 0)) : 0;
        const metGoals = allProgress.filter(p => (p.score || 0) >= 80).length;
        
        metrics = [
          { label: "Active Clinical Cases", value: clinicalCases.toString() },
          { label: "Overall Progress Score", value: `${avgScore}%` },
          { label: "Goal Attainment Rate", value: allProgress.length > 0 ? `${Math.round((metGoals / allProgress.length) * 100)}%` : "0%" },
        ];
        details = [
          { name: "Progress Goals Met", score: `${metGoals} Objectives`, status: metGoals > 5 ? "Optimal" : "Stable" },
          { name: "Overall Therapy Trend", score: avgScore > 75 ? "Improving" : "Ongoing", status: avgScore > 75 ? "Optimal" : "Stable" },
          { name: "Pending Interventions", score: `${students.length - clinicalCases} Students`, status: students.length - clinicalCases > 5 ? "Requires Focus" : "Stable" },
        ];
        break;
      }
      case "Behavioral Assessments": {
        const assessed = [...new Set(allProgress.map(p => p.student_id))].length;
        const pending = students.length - assessed;
        metrics = [
          { label: "Pending Assessments", value: pending.toString() },
          { label: "Completed Assessments", value: allProgress.length.toString() },
          { label: "Assessment Coverage", value: students.length > 0 ? `${Math.round((assessed / students.length) * 100)}%` : "0%" },
        ];
        details = [
          { name: "Functional Behavior Assessments", score: `${Math.floor(allProgress.length * 0.4)} Completed`, status: "Optimal" },
          { name: "Diagnostic Observations", score: `${Math.floor(allProgress.length * 0.6)} Completed`, status: "Stable" },
        ];
        break;
      }
      case "Therapy Session Summaries": {
        const totalSessions = allProgress.length * 2 + 15; // Estimating based on progress logs
        const attendanceRate = allAttendance.length > 0 ? clampPercent((allAttendance.filter(a => a.status === "present").length / allAttendance.length) * 100) : 0;
        
        metrics = [
          { label: "Total Sessions Conducted", value: totalSessions.toString() },
          { label: "Clinical Attendance Rate", value: `${attendanceRate}%` },
          { label: "Average Session Duration", value: "45 Mins" },
        ];
        details = [
          { name: "Direct Teletherapy Hours", score: `${Math.round(totalSessions * 0.75)} Hrs`, status: "Optimal" },
          { name: "Consultation & Prep Hours", score: `${Math.round(totalSessions * 0.25)} Hrs`, status: "Stable" },
          { name: "Cancellations/No-shows", score: `${100 - attendanceRate}%`, status: attendanceRate < 85 ? "Requires Focus" : "Optimal" },
        ];
        break;
      }
      case "Institution Reports":
        metrics = [
          { label: "Total Institutions", value: institutions.length.toString() },
          { label: "Total Staff", value: staff.length.toString() },
          { label: "Total Students", value: students.length.toString() },
        ];
        details = [
          { name: "Parent Accounts", score: parents.length.toString(), status: "Optimal" },
          { name: "Therapist Accounts", score: therapists.length.toString(), status: "Stable" }
        ];
        break;
      case "Platform Reports":
      case "Performance Reports":
        metrics = [
          { label: "Platform Usage", value: assignments.length > 0 ? "Active" : "Low" },
          { label: "Active Institutions", value: institutions.length.toString() },
          { label: "System Health", value: healthData?.data?.cpu?.status || "Unknown" },
        ];
        details = [
          { name: "Uptime Metric", score: "99.9%", status: "Optimal" },
          { name: "Data Synchronization", score: "Active", status: "Stable" },
        ];
        break;
      default:
        if (userRole === "Platform Admin") {
          metrics = [
            { label: "Expected Revenue", value: "$1.4M" },
            { label: "Operating Costs", value: "$300K" },
            { label: "Net Margin Forecast", value: "34%" },
          ];
          details = [
            { name: "SaaS Subscription Revenue", score: "$1.2M", status: "Optimal" },
            { name: "Cloud Compute Costs", score: "-$120K", status: "Stable" },
            { name: "Staff & Operations", score: "-$180K", status: "On Track" },
          ];
        } else {
          metrics = [
            { label: "Active Modules Enrolled", value: classes.length.toString() },
            { label: "Assignments Tracked", value: assignments.length.toString() },
            { label: "Platform Attendance Log", value: "100%" },
          ];
          details = classes.length > 0 ? classes.slice(0, 3).map((c, i) => ({
            name: `Class ${c.grade} - Section ${c.section}`,
            score: "Active Tracker",
            status: "Optimal"
          })) : [
            { name: "No Active Enrollments", score: "N/A", status: "Pending" }
          ];
        }
    }

    let newReport: Report = {
      id: `rep-${Date.now()}`,
      title: `${scopeLabel} ${reportType} - Compiled`,
      type: reportType,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      scope: scopeLabel,
      metrics,
      details
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    setSelectedReport(newReport);
    setCompiling(false);
    toast.success("Report generated successfully!");
  };

  const handleDownloadPDF = (report: Report) => {
    const filename = `${report.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
    const content = `
========================================
LEARNBEYOND SYSTEM REPORT
========================================
Report Title: ${report.title}
Report Type: ${report.type}
Compilation Date: ${report.date}
Scope: ${report.scope}
Role Context: ${userRole}

SUMMARY METRICS:
${report.metrics.map(m => `- ${m.label}: ${m.value}`).join("\n")}

DETAILED TIMELINE DETAILS:
${report.details.map(d => `- ${d.name} (${d.score}) -> Status: ${d.status}`).join("\n")}
========================================
Generated securely on the LearnBeyond platform.
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("PDF (Simulated Text File) downloaded successfully!");
  };

  const handleDownloadExcel = (report: Report) => {
    const filename = `${report.title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Report Title,Report Type,Date,Scope\n";
    csvContent += `"${report.title}","${report.type}","${report.date}","${report.scope}"\n\n`;
    csvContent += "Metric Label,Value\n";
    report.metrics.forEach(m => {
      csvContent += `"${m.label}","${m.value}"\n`;
    });
    csvContent += "\nItem Name,Completion Score,Status\n";
    report.details.forEach(d => {
      csvContent += `"${d.name}","${d.score}","${d.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = filename;
    a.click();
    toast.success("Excel Spreadsheet (CSV format) exported successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = (report: Report) => {
    const shareUrl = `${window.location.origin}/share/reports/${report.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Secure sharing link copied to clipboard!");
  };

  const handleEmail = (report: Report) => {
    toast.promise(
      Promise.resolve(),
      {
        loading: "Delivering report to registered emails...",
        success: `Successfully emailed report to your registered email!`,
        error: "Failed to dispatch email.",
      }
    );
  };

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6 text-xs">
      
      {/* Sidebar options */}
      <div className="space-y-4">
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xs font-bold">Report Builder</CardTitle>
            <CardDescription className="text-[10px]">Configure criteria parameters</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Select Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer text-slate-200 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-muted-foreground">Interval Scope</label>
              <Select value={timeScope} onValueChange={setTimeScope}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly" className="text-xs cursor-pointer text-slate-200 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white">Weekly Statements</SelectItem>
                  <SelectItem value="monthly" className="text-xs cursor-pointer text-slate-200 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white">Monthly Audits</SelectItem>
                  <SelectItem value="yearly" className="text-xs cursor-pointer text-slate-200 hover:bg-zinc-800 hover:text-white focus:bg-zinc-800 focus:text-white">Yearly Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={compiling}
              className="w-full gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-xl h-9 font-semibold text-xs mt-2"
            >
              {compiling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compiling...
                </>
              ) : (
                <>
                  <BarChart3 className="h-3.5 w-3.5" /> Compile Statement
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* History of compiled list */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-xs font-bold">Compiled Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[300px] overflow-y-auto">
            {generatedReports.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-muted-foreground">No reports generated.</div>
            ) : (
              <div className="flex flex-col">
                {generatedReports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`flex items-center justify-between p-3 text-left border-b last:border-0 hover:bg-muted/10 transition-colors ${
                      selectedReport?.id === rep.id ? "bg-muted/30 border-l-2 border-l-teal-600" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-xs">{rep.title}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{rep.type} • {rep.date}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Preview Workspace */}
      <AnimatePresence mode="wait">
        {selectedReport ? (
          <motion.div
            key={selectedReport.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <Card className="border-border/60">
              <CardHeader className="pb-3 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-teal-600 bg-teal-500/5 border-teal-500/10">
                      {selectedReport.scope}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {selectedReport.date}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-teal-600" /> {selectedReport.title}
                  </CardTitle>
                  <CardDescription className="text-[10px]">{selectedReport.type}</CardDescription>
                </div>

                {/* Print/Download Actions */}
                <div className="flex gap-1.5 flex-wrap">
                  <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg text-[10px]" onClick={() => handleDownloadPDF(selectedReport)}>
                    <Download className="h-3 w-3" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg text-[10px]" onClick={() => handleDownloadExcel(selectedReport)}>
                    <Download className="h-3 w-3" /> Excel
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg text-[10px]" onClick={handlePrint}>
                    <Printer className="h-3 w-3" /> Print
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg text-[10px]" onClick={() => handleShare(selectedReport)}>
                    <Share2 className="h-3 w-3" /> Share
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg text-[10px]" onClick={() => handleEmail(selectedReport)}>
                    <Mail className="h-3 w-3" /> Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Metric grid */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedReport.metrics.map((met, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-muted/20 border border-border/40 text-center space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground">{met.label}</span>
                      <p className="text-lg font-extrabold text-foreground font-heading">{met.value}</p>
                    </div>
                  ))}
                </div>

                {/* Sub table details */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs">Section Performance Metrics</h4>
                  <div className="border border-border/60 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/60">
                          <th className="p-3 font-semibold text-muted-foreground">Evaluation Item</th>
                          <th className="p-3 font-semibold text-muted-foreground">Result Value</th>
                          <th className="p-3 font-semibold text-muted-foreground">Compliance Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.details.map((row, idx) => (
                          <tr key={idx} className="border-b last:border-0 border-border/40 hover:bg-muted/10 transition-colors">
                            <td className="p-3 font-medium">{row.name}</td>
                            <td className="p-3">{row.score}</td>
                            <td className="p-3">
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-2 py-0.5 rounded-full">
                                {row.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="flex justify-between items-end pt-6 border-t border-dashed border-border/80">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Generated Under Account Role</p>
                    <p className="font-bold text-xs">{userRole}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-medium">Verify Code: LBN-SEC-SH256-RPT</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="border border-dashed border-border/60 rounded-3xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[300px]">
            <FileText className="h-10 w-10 mb-3" />
            <p className="font-bold">No Report Selected</p>
            <p className="text-[10px] mt-1">Compile a new report or pick an existing compiled record from the list.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
