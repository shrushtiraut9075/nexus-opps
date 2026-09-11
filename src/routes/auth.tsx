import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: Mode | undefined; verified?: boolean | undefined } => ({
    mode: (["login", "signup", "forgot"] as const).includes(search["mode"] as Mode)
      ? (search["mode"] as Mode)
      : undefined,
    verified: search["verified"] === "1" || search["verified"] === true ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in to OpportunityX" },
      { name: "description", content: "Log in or create your free OpportunityX student account." },
      { property: "og:title", content: "Sign in to OpportunityX" },
      { property: "og:description", content: "Log in or create your free OpportunityX student account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, verified } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(initialMode ?? "login");
  const verifiedHandled = useRef(false);

  // Arriving from the email verification link: confirm, clear the temporary
  // session created by the link, and ask the user to log in once.
  useEffect(() => {
    if (!verified || verifiedHandled.current) return;
    verifiedHandled.current = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) await supabase.auth.signOut();
      setMode("login");
      toast.success("Email verified successfully. Please log in to continue.");
      navigate({ to: "/auth", search: { mode: "login" }, replace: true });
    })();
  }, [verified, navigate]);

  const goAfterLogin = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .maybeSingle();
    navigate({ to: data?.onboarding_completed ? "/dashboard" : "/onboarding", replace: true });
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<null | "verify" | "reset">(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode !== "forgot" || true) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e["email"] = "Enter a valid email address";
    }
    if (mode !== "forgot") {
      if (password.length < 6) e["password"] = "Password must be at least 6 characters";
    }
    if (mode === "signup") {
      if (fullName.trim().length < 2) e["fullName"] = "Please enter your full name";
      if (password !== confirm) e["confirm"] = "Passwords do not match";
      if (!agree) e["agree"] = "You must accept the Terms & Privacy Policy";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        if (data.user) await goAfterLogin(data.user.id);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?verified=1`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created");
          navigate({ to: "/onboarding", replace: true });
        } else {
          setSent("verify");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed. Please try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  const resend = async () => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error(error.message);
    else toast.success("Verification email sent again");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gradient-subtle px-4 py-10">
      <Logo />
      <Card className="mt-6 w-full max-w-md shadow-elevate">
        <CardContent className="p-7">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                <Mail className="size-6" />
              </div>
              <h1 className="mt-4 font-display text-xl font-bold">
                {sent === "verify" ? "Verify your email" : "Check your inbox"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a {sent === "verify" ? "verification" : "password reset"} link to <strong>{email}</strong>.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {sent === "verify" && (
                  <Button variant="outline" onClick={resend}>
                    Resend verification email
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSent(null);
                    setMode("login");
                  }}
                >
                  Back to login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your free account" : "Reset your password"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "forgot"
                  ? "We'll email you a secure link to set a new password."
                  : "Discover. Match. Apply. Grow."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                {mode === "signup" && (
                  <Field label="Full Name" error={errors["fullName"]}>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                  </Field>
                )}
                <Field label="Email" error={errors["email"]}>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </Field>
                {mode !== "forgot" && (
                  <Field label="Password" error={errors["password"]}>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />
                  </Field>
                )}
                {mode === "signup" && (
                  <>
                    <Field label="Confirm Password" error={errors["confirm"]}>
                      <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
                    </Field>
                    <div>
                      <label className="flex items-start gap-2.5 text-sm">
                        <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="mt-0.5" />
                        <span className="text-muted-foreground">
                          I agree to the{" "}
                          <Link to="/terms" className="text-primary underline">Terms</Link> &{" "}
                          <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                        </span>
                      </label>
                      {errors["agree"] && <p className="mt-1 text-xs text-destructive">{errors["agree"]}</p>}
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  {mode === "login" ? "Login" : mode === "signup" ? "Create Free Account" : "Send reset link"}
                </Button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={google} disabled={loading}>
                    <GoogleIcon /> Continue with Google
                  </Button>
                </>
              )}

              <div className="mt-6 space-y-2 text-center text-sm">
                {mode === "login" && (
                  <>
                    <button className="text-primary hover:underline" onClick={() => setMode("forgot")}>
                      Forgot password?
                    </button>
                    <p className="text-muted-foreground">
                      New here?{" "}
                      <button className="text-primary hover:underline" onClick={() => setMode("signup")}>
                        Create Account
                      </button>
                    </p>
                  </>
                )}
                {mode !== "login" && (
                  <button className="text-primary hover:underline" onClick={() => setMode("login")}>
                    Back to login
                  </button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Link to="/" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        ← Back to home
      </Link>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div id={id}>{children}</div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
