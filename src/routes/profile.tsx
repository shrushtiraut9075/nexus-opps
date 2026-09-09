import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/AppLayout";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { profileCompletion } from "@/lib/matching";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — OpportunityX" },
      { name: "description", content: "Edit your education, skills, interests, career goals and resume on OpportunityX." },
      { property: "og:title", content: "My profile — OpportunityX" },
      { property: "og:description", content: "Edit your education, skills, interests, career goals and resume on OpportunityX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      city: profile.city ?? "",
      country: profile.country ?? "",
      college: profile.college ?? "",
      degree: profile.degree ?? "",
      branch: profile.branch ?? "",
      current_year: profile.current_year ?? "",
      graduation_year: profile.graduation_year ?? "",
      cgpa: profile.cgpa ?? "",
      target_role: profile.target_role ?? "",
      preferred_industry: profile.preferred_industry ?? "",
      work_mode: profile.work_mode ?? "",
      experience_level: profile.experience_level ?? "",
      projects: profile.projects ?? "",
      achievements: profile.achievements ?? "",
      skills: (profile.skills ?? []).join(", "),
      interests: (profile.interests ?? []).join(", "),
      preferred_types: (profile.preferred_types ?? []).join(", "),
    });
  }, [profile]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toList = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

  const save = async () => {
    try {
      await update.mutateAsync({
        full_name: form["full_name"] ?? "",
        city: form["city"] ?? "",
        country: form["country"] ?? "",
        college: form["college"] ?? "",
        degree: form["degree"] ?? "",
        branch: form["branch"] ?? "",
        current_year: form["current_year"] ?? "",
        graduation_year: form["graduation_year"] ?? "",
        cgpa: form["cgpa"] ?? "",
        target_role: form["target_role"] ?? "",
        preferred_industry: form["preferred_industry"] ?? "",
        work_mode: form["work_mode"] ?? "",
        experience_level: form["experience_level"] ?? "",
        projects: form["projects"] ?? "",
        achievements: form["achievements"] ?? "",
        skills: toList(form["skills"] ?? ""),
        interests: toList(form["interests"] ?? ""),
        preferred_types: toList(form["preferred_types"] ?? ""),
      });
      toast.success("Profile updated");
    } catch (e) {
      toast.error("Couldn't save your profile", { description: (e as Error).message });
    }
  };

  const completion = profileCompletion(profile as unknown as Record<string, unknown>);

  return (
    <AppLayout title="My Profile" actions={<Button size="sm" onClick={save} disabled={update.isPending}>{update.isPending ? "Saving…" : "Save changes"}</Button>}>
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="text-sm font-medium">Profile {completion}% complete</p>
          <Progress value={completion} className="mt-2" aria-label="Profile completion" />
          <p className="mt-2 text-xs text-muted-foreground">
            Resume on file: {profile?.resume_name || "none"} · <Link to="/resume-analyzer" className="underline">Update resume</Link>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Personal details">
          <F label="Full name" k="full_name" form={form} set={set} />
          <F label="City" k="city" form={form} set={set} />
          <F label="Country" k="country" form={form} set={set} />
        </Section>
        <Section title="Education">
          <F label="College / university" k="college" form={form} set={set} />
          <F label="Degree" k="degree" form={form} set={set} />
          <F label="Branch" k="branch" form={form} set={set} />
          <F label="Current year" k="current_year" form={form} set={set} />
          <F label="Graduation year" k="graduation_year" form={form} set={set} />
          <F label="CGPA / percentage" k="cgpa" form={form} set={set} />
        </Section>
        <Section title="Skills & interests">
          <F label="Skills (comma separated)" k="skills" form={form} set={set} />
          <F label="Interests (comma separated)" k="interests" form={form} set={set} />
          <F label="Preferred opportunity types (comma separated)" k="preferred_types" form={form} set={set} />
        </Section>
        <Section title="Career & experience">
          <F label="Target role" k="target_role" form={form} set={set} />
          <F label="Preferred industry" k="preferred_industry" form={form} set={set} />
          <F label="Preferred work mode" k="work_mode" form={form} set={set} />
          <F label="Experience level" k="experience_level" form={form} set={set} />
          <div className="space-y-1.5">
            <Label htmlFor="projects">Projects</Label>
            <Textarea id="projects" rows={3} value={form["projects"] ?? ""} onChange={(e) => set("projects", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="achievements">Achievements</Label>
            <Textarea id="achievements" rows={3} value={form["achievements"] ?? ""} onChange={(e) => set("achievements", e.target.value)} />
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function F({ label, k, form, set }: { label: string; k: string; form: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
    </div>
  );
}
