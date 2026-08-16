"use client";

import { CreditCard, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/AdminUI";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useInstitutions } from "@/hooks/useInstitutions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateInstitution } from "@/hooks/useInstitutions";

const PLANS = [
  {
    name: "Starter",
    price: "$49/mo",
    features: ["Up to 100 students", "5 teachers", "Basic analytics", "Email support"],
    badge: "bg-secondary text-secondary-foreground",
  },
  {
    name: "Professional",
    price: "$149/mo",
    features: ["Up to 500 students", "30 teachers", "Advanced analytics", "Laura AI assistant", "Priority support"],
    badge: "bg-primary text-primary-foreground",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited students", "Unlimited teachers", "Full analytics suite", "Laura AI + clinical tools", "Dedicated support", "SLA guarantee"],
    badge: "bg-secondary text-secondary-foreground",
  },
];

export default function SubscriptionsPage() {
  const { data, isLoading } = useInstitutions(100, 0);
  const institutions = data?.data ?? [];
  const { mutate: updateInstitution, isPending } = useUpdateInstitution();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");

  const handleAssignPlan = () => {
    if (!selectedInstitutionId) {
      toast.error("Please select an institution first.");
      return;
    }
    updateInstitution(
      { id: selectedInstitutionId, payload: { subscription_status: 'active', subscription_plan: selectedPlan || undefined } },
      { 
        onSuccess: () => {
          toast.success(`Successfully assigned ${selectedPlan} plan!`);
          setSelectedPlan(null);
          setSelectedInstitutionId("");
        }
      }
    );
  };

  return (
    <div className="max-w-6xl space-y-8">
      <PageHeader
        title="Subscriptions"
        subtitle="Manage institution subscription plans and billing"
      />

      {/* Plans */}
      <div>
        <h2 className="text-base font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${plan.highlighted ? "border-primary shadow-lg shadow-primary/10" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute top-3 right-3 text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-medium">
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <div className="text-2xl font-bold font-heading">{plan.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Assign Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Institution Subscription Status */}
      <div>
        <h2 className="text-base font-semibold mb-4">Institution Subscription Status</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : institutions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No institutions registered yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {institutions.map((inst, idx) => {
              // Since the backend doesn't have subscription fields, we simulate status
              const statuses = ["active", "active", "expiring", "inactive"];
              const plans = ["Professional", "Starter", "Professional", "Enterprise"];
              const status = statuses[idx % statuses.length];
              const plan = plans[idx % plans.length];

              return (
                <Card key={inst.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-1.5 rounded-lg ${status === "active" ? "bg-green-500/10 text-green-500" : status === "expiring" ? "bg-yellow-500/10 text-yellow-500" : "bg-destructive/10 text-destructive"}`}>
                        {status === "active" ? <CheckCircle className="h-4 w-4" /> : status === "expiring" ? <Clock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">Since {format(new Date(inst.created_at), "MMM d, yyyy")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary">{plan}</span>
                        <p className={`text-xs mt-1 capitalize font-medium ${status === "active" ? "text-green-500" : status === "expiring" ? "text-yellow-500" : "text-destructive"}`}>
                          {status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.info("Management portal coming soon!")}>Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {selectedPlan} Plan</DialogTitle>
            <DialogDescription>
              Select an institution to upgrade to the {selectedPlan} tier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Institution</label>
              <Select value={selectedInstitutionId} onValueChange={setSelectedInstitutionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an institution..." />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map(inst => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
            <Button disabled={isPending} onClick={handleAssignPlan}>
              {isPending ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
