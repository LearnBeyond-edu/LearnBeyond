"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BrainCircuit, GraduationCap, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold tracking-tight">LearnBeyond</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#ai" className="hover:text-primary transition-colors">Laura AI</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 flex flex-col items-center text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container px-4 max-w-4xl"
          >
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Introducing Laura AI 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              The Future of Personalized Education
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Empower your institution with state-of-the-art AI. Tailored learning paths, intelligent assistance, and comprehensive analytics.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="rounded-full h-12 px-8 text-base">
                  Start for Free <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                  Explore Features
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading mb-4">Everything you need to succeed</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A unified platform connecting students, teachers, parents, and therapists.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Smart Curriculum", icon: BookOpenIcon, desc: "AI-generated lesson plans adapting to student pace." },
                { title: "VAKT Methodology", icon: BrainCircuit, desc: "Visual, Auditory, Kinesthetic, and Tactile learning styles supported natively." },
                { title: "Secure & Compliant", icon: ShieldCheck, desc: "Enterprise-grade security protecting sensitive student data." },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-6 bg-background rounded-3xl border shadow-sm"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Section */}
        <section id="ai" className="py-24">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                  Meet Laura AI
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Your Personal Teaching Assistant</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Laura AI remembers every student's learning history, helps teachers grade faster, and guides parents with personalized advice.
                </p>
                <ul className="space-y-4">
                  {[
                    "24/7 Student Support",
                    "Automated Rubric Grading",
                    "Early Intervention Alerts"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            <div className="flex-1">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary border shadow-2xl overflow-hidden relative flex items-center justify-center">
                <BrainCircuit className="w-32 h-32 text-primary opacity-50 animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold tracking-tight">LearnBeyond</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LearnBeyond Inc. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
