import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — OpportunityX" },
      { name: "description", content: "Choose a new password for your OpportunityX account." },
      { property: "og:title", content: "Set a new password — OpportunityX" },
      { property: "og:description", content: "Choose a new password for your OpportunityX account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      toast.error(err.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-subtle px-4">
      <Logo />
      <Card className="mt-6 w-full max-w-md shadow-elevate">
        <CardContent className="p-7">
          <h1 className="font-display text-2xl font-bold">Set a new password</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
