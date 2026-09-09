import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import {
  CATEGORIES,
  EXPERIENCE_LEVELS,
  INTEREST_OPTIONS,
  SKILL_OPTIONS,
  WORK_MODES,
  profileCompletion,
} from "@/lib/matching";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — OpportunityX" },
      { name: "description", content: "Tell OpportunityX about your skills, interests and goals to unlock personalised opportunity matches." },
      { property: "og:title", content: "Set up your profile — OpportunityX" },
      { property: "og:description", content: "Eight quick steps to personalised opportunity matches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

type Draft = {
  full_name: string;
  city: string;
  country: string;
  avatar_url: string;
  college: string;
  degree: string;
  branch: string;
  current_year: string;
  graduation_year: string;
  cgpa: string;
  skills: string[];
  interests: string[];
  preferred_types: string[];
  target_role: string;
  preferred_industry: string;
  work_mode: string;
  experience_level: string;
  projects: string;
  achievements: string;
  resume_name: string;
};

const EMPTY: Draft = {
  full_name: "",
  city: "",
  country: "India",
  avatar_url: "",
  college: "",
  degree: "",
  branch: "",
  current_year: "",
  graduation_year: "",
  cgpa: "",
  skills: [],
  interests: [],
  preferred_types: [],
  target_role: "",
  preferred_industry: "",
  work_mode: "",
  experience_level: "",
  projects: "",
  achievements: "",
  resume_name: "",
};

const STEPS = [
  "Personal",
  "Education",
  "Skills",
  "Interests",
  "Opportunities",
  "Career goals",
  "Experience",
  "Resume",
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { mode: "login" } });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    setDraft((d) => ({
      ...d,
      full_name: profile.full_name ?? d.full_name,
      city: profile.city ?? d.city,
      country: profile.country ?? d.country,
      college: profile.college ?? d.college,
      degree: profile.degree ?? d.degree,
      branch: profile.branch ?? d.branch,
      current_year: profile.current_year ?? d.current_year,
      graduation_year: profile.graduation_year ?? d.graduation_year,
      cgpa: profile.cgpa ?? d.cgpa,
      skills: profile.skills?.length ? profile.skills : d.skills,
      interests: profile.interests?.length ? profile.interests : d.interests,
      preferred_types: profile.preferred_types?.length ? profile.preferred_types : d.preferred_types,
      target_role: profile.target_role ?? d.target_role,
      preferred_industry: profile.preferred_industry ?? d.preferred_industry,
      work_mode: profile.work_mode ?? d.work_mode,
      experience_level: profile.experience_level ?? d.experience_level,
      projects: profile.projects ?? d.projects,
      achievements: profile.achievements ?? d.achievements,
      resume_name: profile.resume_name ?? d.resume_name,
    }));
  }, [profile]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const toggle = (key: "skills" | "interests" | "preferred_types", value: string) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));

  const completion = profileCompletion(draft as unknown as Record<string, unknown>);

  const finish = async () => {
    try {
      await update.mutateAsync({ ...draft, onboarding_completed: true });
      toast.success("Your OpportunityX profile is ready!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error("We couldn't save your profile", { description: (e as Error).message });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Logo />
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">{STEPS[step]}</span>
            <span className="text-muted-foreground">Profile {completion}% complete</span>
          </div>
          <Progress value={completion} aria-label="Profile completion" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && (
            <Section title="Tell us about you" description="This personalises everything you'll see.">
              <Field label="Full name">
                <Input value={draft.full_name} onChange={(e) => set({ full_name: e.target.value })} placeholder="Bhakti Sarode" />
              </Field>
              <Field label="Profile photo URL (optional)">
                <Input value={draft.avatar_url} onChange={(e) => set({ avatar_url: e.target.value })} placeholder="https://…" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City">
                  <Input value={draft.city} onChange={(e) => set({ city: e.target.value })} placeholder="Pune" />
                </Field>
                <Field label="Country">
                  <Input value={draft.country} onChange={(e) => set({ country: e.target.value })} />
                </Field>
              </div>
            </Section>
          )}

          {step === 1 && (
            <Section title="Your education" description="Used to check eligibility for scholarships and internships.">
              <Field label="College / university">
                <Input value={draft.college} onChange={(e) => set({ college: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Degree">
                  <Input value={draft.degree} onChange={(e) => set({ degree: e.target.value })} placeholder="B.Tech" />
                </Field>
                <Field label="Branch / field">
                  <Input value={draft.branch} onChange={(e) => set({ branch: e.target.value })} placeholder="Computer Science" />
                </Field>
                <Field label="Current year">
                  <Input value={draft.current_year} onChange={(e) => set({ current_year: e.target.value })} placeholder="3rd year" />
                </Field>
                <Field label="Graduation year">
                  <Input value={draft.graduation_year} onChange={(e) => set({ graduation_year: e.target.value })} placeholder="2027" />
                </Field>
                <Field label="CGPA / percentage">
                  <Input value={draft.cgpa} onChange={(e) => set({ cgpa: e.target.value })} placeholder="8.4" />
                </Field>
              </div>
            </Section>
          )}

          {step === 2 && (
            <Section title="Your skills" description="Skills carry the largest weight (40%) in your match score.">
              <div className="flex flex-wrap gap-2">
                {[...new Set([...SKILL_OPTIONS, ...draft.skills])].map((s) => (
                  <Chip key={s} label={s} active={draft.skills.includes(s)} onClick={() => toggle("skills", s)} />
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add another skill"
                  aria-label="Add a custom skill"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const v = customSkill.trim();
                    if (!v) return;
                    if (!draft.skills.includes(v)) set({ skills: [...draft.skills, v] });
                    setCustomSkill("");
                  }}
                >
                  Add
                </Button>
              </div>
            </Section>
          )}

          {step === 3 && (
            <Section title="What interests you?" description="We use this to judge career relevance (20%).">
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((s) => (
                  <Chip key={s} label={s} active={draft.interests.includes(s)} onClick={() => toggle("interests", s)} />
                ))}
              </div>
            </Section>
          )}

          {step === 4 && (
            <Section title="Opportunity types" description="Pick everything you'd like to hear about.">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={draft.preferred_types.includes(s)}
                    onClick={() => toggle("preferred_types", s)}
                  />
                ))}
              </div>
            </Section>
          )}

          {step === 5 && (
            <Section title="Career goals" description="Where are you heading?">
              <Field label="Target role">
                <Input value={draft.target_role} onChange={(e) => set({ target_role: e.target.value })} placeholder="Machine Learning Engineer" />
              </Field>
              <Field label="Preferred industry">
                <Input value={draft.preferred_industry} onChange={(e) => set({ preferred_industry: e.target.value })} placeholder="AI / Deep Tech" />
              </Field>
              <Field label="Preferred work mode">
                <Select value={draft.work_mode} onValueChange={(v) => set({ work_mode: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose a work mode" /></SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>
          )}

          {step === 6 && (
            <Section title="Experience" description="Helps us pitch opportunities at the right level.">
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((l) => (
                  <Chip key={l} label={l} active={draft.experience_level === l} onClick={() => set({ experience_level: l })} />
                ))}
              </div>
              <Field label="Projects">
                <Textarea
                  rows={3}
                  value={draft.projects}
                  onChange={(e) => set({ projects: e.target.value })}
                  placeholder="Sentiment analysis app, campus event portal…"
                />
              </Field>
              <Field label="Achievements">
                <Textarea
                  rows={3}
                  value={draft.achievements}
                  onChange={(e) => set({ achievements: e.target.value })}
                  placeholder="Smart India Hackathon finalist…"
                />
              </Field>
            </Section>
          )}

          {step === 7 && (
            <Section
              title="Resume"
              description="Demo upload: the file name is stored on your profile so the analyzer has something to work with. The file itself stays on your device."
            >
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-6 py-10 text-center hover:border-primary/50">
                <Upload className="size-6 text-primary" />
                <span className="text-sm font-medium">
                  {draft.resume_name || "Choose a PDF or Word resume"}
                </span>
                <span className="text-xs text-muted-foreground">PDF, DOC or DOCX up to 5 MB</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("That file is larger than 5 MB");
                      return;
                    }
                    set({ resume_name: file.name });
                    toast.success("Resume attached (demo)");
                  }}
                />
              </label>
            </Section>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft className="mr-1 size-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={update.isPending}>
                <Check className="mr-1 size-4" />
                {update.isPending ? "Saving…" : "Generate My Recommendations"}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          You can change any of this later from your profile.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
