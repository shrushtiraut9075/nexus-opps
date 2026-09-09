import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_PRICE_INR } from "@/lib/matching";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — OpportunityX" },
      { name: "description", content: "Manage your account, notification consent, privacy choices and subscription." },
      { property: "og:title", content: "Settings — OpportunityX" },
      { property: "og:description", content: "Manage your account, notification consent, privacy choices and subscription." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const navigate = useNavigate();

  const toggle = (key: "notify_email" | "notify_deadlines" | "profile_public", value: boolean) =>
    update.mutate({ [key]: value }, { onSuccess: () => toast.success("Preference saved") });

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="font-display text-base font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild><Link to="/profile">Edit profile</Link></Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!user?.email) return;
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast.error(error.message);
                  else toast.success("Password reset email sent");
                }}
              >
                Change password
              </Button>
              <Button variant="ghost" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>Logout</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-base font-semibold">Notifications</h2>
            <p className="text-xs text-muted-foreground">Nothing is sent unless you switch it on here.</p>
            <Row id="notify_email" label="Email me about new matching opportunities" checked={!!profile?.notify_email} onChange={(v) => toggle("notify_email", v)} />
            <Row id="notify_deadlines" label="Remind me about approaching deadlines" checked={!!profile?.notify_deadlines} onChange={(v) => toggle("notify_deadlines", v)} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-base font-semibold">Privacy</h2>
            <Row id="profile_public" label="Make my profile visible to other students" checked={!!profile?.profile_public} onChange={(v) => toggle("profile_public", v)} />
            <p className="text-xs text-muted-foreground">Your resume and applications are always private to you.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="font-display text-base font-semibold">Subscription</h2>
            <p className="text-sm text-muted-foreground">
              Current plan: <span className="font-medium text-foreground">{profile?.plan === "premium" ? "Premium" : "Free"}</span>
              {profile?.plan !== "premium" && ` · Premium is ₹${PREMIUM_PRICE_INR}/month`}
            </p>
            <Button asChild><Link to="/pricing">{profile?.plan === "premium" ? "Manage plan" : "Upgrade to Premium"}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Row({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
