"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Sparkles, Building2, UserPlus, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <Card className="shadow-2xl border-border/50 bg-background/80 backdrop-blur-xl">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-bold font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Join LearnBeyond
            </CardTitle>
            <CardDescription className="text-base">
              LearnBeyond is an enterprise education platform. 
              Account creation is managed by your institution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl border bg-muted/30 transition-colors hover:bg-muted/50">
                <div className="mt-1 bg-background p-2 rounded-xl shadow-sm border">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">For Institutions</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Want to bring LearnBeyond to your school? Contact our sales team for a custom enterprise setup.
                  </p>
                  <Button variant="link" className="px-0 mt-1 h-auto text-primary">Contact Sales &rarr;</Button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl border bg-muted/30 transition-colors hover:bg-muted/50">
                <div className="mt-1 bg-background p-2 rounded-xl shadow-sm border">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">For Students & Teachers</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check your school email for an invitation link, or request access directly from your administrator.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t text-center space-y-4">
              <p className="text-sm text-muted-foreground">Already have an account?</p>
              <Link href="/login" className="block">
                <Button className="w-full h-11 text-base rounded-xl" size="lg">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
            
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
