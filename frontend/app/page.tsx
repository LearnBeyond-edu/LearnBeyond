"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowRight, Sparkles, BrainCircuit, GraduationCap, ShieldCheck, 
  Activity, Users, Zap, CheckCircle2, ChevronRight 
} from "lucide-react";
import { useRef } from "react";

export default function LandingPage() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [100, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <span className="font-heading text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              LearnBeyond
            </span>
          </motion.div>
          <nav className="hidden md:flex gap-8 items-center text-sm font-medium">
            {["Platform", "Features", "Laura AI", "Pricing"].map((item, i) => (
              <motion.a 
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              >
                {item}
              </motion.a>
            ))}
          </nav>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" className="font-semibold hover:bg-primary/10 hover:text-primary">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="font-semibold rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 flex flex-col items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="flex items-center justify-center w-full mb-8"
          >
            <div className="w-full max-w-2xl h-[300px] md:h-[450px] flex items-center justify-center">
               <img 
                 src="/logo.png" 
                 alt="LearnBeyond Logo" 
                 className="hidden dark:block w-full h-full mix-blend-screen object-contain" 
                 style={{ 
                   WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)',
                   maskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)'
                 }}
               />
               <img 
                 src="/logo1.png" 
                 alt="LearnBeyond Logo" 
                 className="block dark:hidden w-full h-full mix-blend-normal object-contain" 
                 style={{ 
                   WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)',
                   maskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)'
                 }}
               />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            <span className="flex items-center">
              Introducing Laura AI 2.0 <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-heading tracking-tighter mb-8 max-w-5xl leading-[1.1]"
          >
            Education,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-teal-400 animate-gradient-x">
              Reimagined.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The world's first AI-native unified platform connecting students, educators, parents, and therapists in one seamless ecosystem.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                Start for Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-lg font-bold border-2 hover:bg-muted/50 transition-all">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Dashboard Preview Section (Visual Anchor) */}
        <section className="relative px-4 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, type: "spring", stiffness: 50 }}
            className="max-w-6xl mx-auto relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[32px] blur opacity-20 animate-pulse"></div>
            <div className="relative rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-background"></div>
               {/* Realistic Dashboard UI Mockup */}
               <div className="relative w-full h-full p-6 flex gap-6">
                  {/* Mock Sidebar */}
                  <div className="w-56 h-full bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-4 flex flex-col gap-2">
                     <div className="flex items-center gap-2 mb-6 px-2">
                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">LearnBeyond</span>
                     </div>
                     {[
                       { icon: Activity, label: "Dashboard", active: true },
                       { icon: Users, label: "Students", active: false },
                       { icon: BrainCircuit, label: "Therapy", active: false },
                       { icon: Sparkles, label: "Laura AI", active: false },
                     ].map((item, i) => (
                       <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${item.active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted/50'}`}>
                         <item.icon className="w-4 h-4" />
                         {item.label}
                       </div>
                     ))}
                  </div>
                  
                  {/* Mock Main Content */}
                  <div className="flex-1 flex flex-col gap-6">
                     {/* Mock Topbar */}
                     <div className="w-full h-16 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 flex items-center justify-between px-6">
                        <div className="space-y-1">
                           <div className="text-sm font-bold">Good morning, Dr. Smith</div>
                           <div className="text-xs text-muted-foreground">Here's what's happening today.</div>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <ShieldCheck className="w-4 h-4 text-primary" />
                           </div>
                           <div className="w-8 h-8 rounded-full bg-muted border border-border"></div>
                        </div>
                     </div>
                     
                     {/* Mock Stats */}
                     <div className="grid grid-cols-3 gap-4">
                        {[
                           { label: "Active Students", value: "1,248", trend: "+12%" },
                           { label: "Avg. VAKT Score", value: "92%", trend: "+5%" },
                           { label: "AI Insights", value: "24 New", trend: "Action Required" },
                        ].map((stat, i) => (
                           <div key={i} className="bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-4 flex flex-col justify-between">
                              <span className="text-xs text-muted-foreground">{stat.label}</span>
                              <div className="flex items-end justify-between mt-2">
                                 <span className="text-xl font-bold">{stat.value}</span>
                                 <span className="text-[10px] text-primary">{stat.trend}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                     
                     {/* Mock Chart */}
                     <div className="flex-1 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                           <span className="text-sm font-bold">Learning Progression (30 Days)</span>
                           <span className="text-xs text-muted-foreground border border-border px-2 py-1 rounded-md">Export</span>
                        </div>
                        <div className="w-full flex-1 bg-primary/5 rounded-xl border border-primary/10 flex items-end p-4 gap-3 relative">
                           {/* Chart Grid Lines */}
                           <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                             <div className="w-full border-t border-dashed border-primary"></div>
                             <div className="w-full border-t border-dashed border-primary"></div>
                             <div className="w-full border-t border-dashed border-primary"></div>
                           </div>
                           {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                              <motion.div 
                                key={i} 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                                className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t-md relative z-10 hover:brightness-125 transition-all cursor-pointer"
                              ></motion.div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Value Metrics */}
        <section className="border-y border-border/40 bg-muted/20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/40 text-center">
              {[
                { label: "Active Institutions", value: "500+" },
                { label: "AI Interactions", value: "2M+" },
                { label: "Student Success", value: "98%" },
                { label: "Time Saved/Week", value: "15 hrs" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center justify-center"
                >
                  <h4 className="text-4xl md:text-5xl font-black text-foreground mb-2">{stat.value}</h4>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-4" ref={targetRef}>
            <motion.div style={{ opacity, y }} className="text-center mb-20">
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">Enterprise Grade</h2>
              <h3 className="text-4xl md:text-6xl font-bold font-heading mb-6 tracking-tight">Built for modern education</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything an institution needs to deliver personalized, compliant, and deeply engaging learning experiences.
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                { title: "Dynamic VAKT Paths", icon: Activity, desc: "Automatically adjusts curriculum based on Visual, Auditory, Kinesthetic, and Tactile learning preferences." },
                { title: "Therapist Integration", icon: Users, desc: "The first platform to natively include clinical therapists in the student's daily educational loop." },
                { title: "Bank-Level Security", icon: ShieldCheck, desc: "FERPA compliant, encrypted at rest and in transit, ensuring maximum data protection." },
                { title: "Real-time Analytics", icon: BrainCircuit, desc: "Predictive AI models identify struggling students weeks before they fall behind." },
                { title: "Automated Grading", icon: CheckCircle2, desc: "Laura AI processes rubrics in seconds, giving teachers their weekends back." },
                { title: "Instant Sync", icon: Zap, desc: "Changes made by a teacher instantly reflect on the parent and student dashboards." },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-8 bg-card rounded-[24px] border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto bg-background p-12 md:p-20 rounded-[40px] border shadow-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-black font-heading mb-6">Ready to transform your school?</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Join hundreds of institutions already using LearnBeyond to elevate their educational standards.
              </p>
              <Link href="/register">
                <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  Get Started Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-background pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex items-center">
              <div className="w-48 md:w-64 h-32 flex items-center justify-start">
                <img 
                  src="/logo.png" 
                  alt="LearnBeyond" 
                  className="hidden dark:block w-full h-full mix-blend-screen object-contain" 
                  style={{ 
                    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)'
                  }}
                />
                <img 
                  src="/logo1.png" 
                  alt="LearnBeyond" 
                  className="block dark:hidden w-full h-full mix-blend-normal object-contain" 
                  style={{ 
                    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 75%)'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-8 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Platform</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t border-border/40 pt-8">
            © {new Date().getFullYear()} LearnBeyond Inc. All rights reserved. Designed with precision.
          </div>
        </div>
      </footer>
    </div>
  );
}
