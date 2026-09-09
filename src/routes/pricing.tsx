import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, CreditCard, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { PREMIUM_PRICE_INR } from "@/lib/matching";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free vs Premium | OpportunityX" },
      { name: "description", content: "Start free with matching, saving and application tracking, or go Premium at ₹199/month for premium listings and priority matching." },
      { property: "og:title", content: "OpportunityX Pricing — Free vs Premium" },
      { property: "og:description", content: "Free forever, or Premium at ₹199 per month for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

const FEATURES: { label: string; free: boolean; premium: boolean }[] = [
  { label: "Full opportunity catalogue", free: true, premium: true },
  { label: "Transparent AI match scores", free: true, premium: true },
  { label: "Save opportunities", free: true, premium: true },
  { label: "Application tracker", free: true, premium: true },
  { label: "Deadline board", free: true, premium: true },
  { label: "Skill gap analyzer", free: true, premium: true },
  { label: "Premium-only listings", free: false, premium: true },
  { label: "Priority matching & early alerts", free: false, premium: true },
  { label: "Resume analyzer with keyword scoring", free: false, premium: true },
  { label: "Career roadmap with milestones", free: false, premium: true },
  { label: "AI career assistant", free: false, premium: true },
];

function PricingPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isPremium = profile?.plan === "premium";

  const checkout = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      update.mutate(
        { plan: "premium" },
        {
          onSuccess: () => {
            setProcessing(false);
            setOpen(false);
            toast.success("Premium activated (demo — no payment taken)");
          },
          onError: (err) => {
            setProcessing(false);
            toast.error(err instanceof Error ? err.message : "Could not update plan");
          },
        },
      );
    }, 1200);
  };

  return (
    <PublicLayout>
      <PageHeader
        title="Simple pricing for students"
        subtitle="Everything you need to find opportunities is free. Upgrade when you want the extras."
      />

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div>
                <h2 className="font-display text-xl font-semibold">Free</h2>
                <p className="text-sm text-muted-foreground">For every student, forever.</p>
              </div>
              <p className="font-display text-4xl font-bold">₹0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <ul className="space-y-2 text-sm">
                {FEATURES.filter((f) => f.free).map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to={user ? "/dashboard" : "/auth"}>{user ? "Go to dashboard" : "Get started free"}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-lg">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">Premium</h2>
                  <p className="text-sm text-muted-foreground">For students actively applying.</p>
                </div>
                <Badge className="gap-1"><Sparkles className="size-3" /> Popular</Badge>
              </div>
              <p className="font-display text-4xl font-bold">
                ₹{PREMIUM_PRICE_INR}<span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-sm">
                {FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f.label}</span>
                  </li>
                ))}
              </ul>
              {isPremium ? (
                <Button className="w-full" disabled>You're on Premium</Button>
              ) : user ? (
                <Button className="w-full" onClick={() => setOpen(true)}>
                  <CreditCard className="size-4" /> Upgrade for ₹{PREMIUM_PRICE_INR}
                </Button>
              ) : (
                <Button className="w-full" asChild><Link to="/auth">Sign up to upgrade</Link></Button>
              )}
              <p className="text-xs text-muted-foreground">Demo checkout — no card is charged.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <caption className="pb-3 text-left font-display text-lg font-semibold">Compare plans</caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 font-medium">Feature</th>
                <th className="py-3 text-center font-medium">Free</th>
                <th className="py-3 text-center font-medium">Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.label} className="border-b border-border/60">
                  <td className="py-3 pr-4">{f.label}</td>
                  <td className="py-3 text-center">{f.free ? <Check className="mx-auto size-4 text-primary" /> : <X className="mx-auto size-4 text-muted-foreground" />}</td>
                  <td className="py-3 text-center"><Check className="mx-auto size-4 text-primary" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={open} onOpenChange={(v) => !processing && setOpen(v)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium</DialogTitle>
            <DialogDescription>
              ₹{PREMIUM_PRICE_INR} per month. This is a simulated checkout — do not enter real card details.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={checkout}>
            <div className="space-y-2">
              <Label htmlFor="card">Card number</Label>
              <Input id="card" required inputMode="numeric" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp">Expiry</Label>
                <Input id="exp" required placeholder="12/29" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" required placeholder="123" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? <><Loader2 className="size-4 animate-spin" /> Processing…</> : `Pay ₹${PREMIUM_PRICE_INR}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
