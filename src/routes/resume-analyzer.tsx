import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/AppLayout";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { SKILL_OPTIONS } from "@/lib/matching";

export const Route = createFileRoute("/resume-analyzer")({
  head: () => ({
    meta: [
      { title: "Resume analyzer — OpportunityX" },
      { name: "description", content: "Paste or attach your resume to get a demo strength score, keyword coverage and matched opportunities." },
      { property: "og:title", content: "Resume analyzer — OpportunityX" },
      { property: "og:description", content: "Paste or attach your resume to get a demo strength score, keyword coverage and matched opportunities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResumePage,
});

function ResumePage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { scored } = useScoredOpportunities();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ score: number; found: string[]; missing: string[] } | null>(null);

  const analyze = () => {
    const body = text.toLowerCase();
    if (body.trim().length < 40) {
      toast.error("Paste a bit more of your resume text to analyse it");
      return;
    }
    const found = SKILL_OPTIONS.filter((s) => body.includes(s.toLowerCase()));
    const missing = (profile?.skills ?? []).filter((s) => !body.includes(s.toLowerCase()));
    const sections = ["education", "project", "experience", "certificat", "achievement"].filter((k) => body.includes(k));
    const score = Math.min(98, 25 + found.length * 5 + sections.length * 8 + (body.length > 800 ? 10 : 0));
    setResult({ score, found, missing });
    toast.success("Demo analysis complete");
  };

  const recommended = [...scored]
    .filter((o) => result ? o.required_skills.some((s) => result.found.includes(s)) : false)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 3);

  return (
    <AppLayout title="Resume Analyzer" subtitle="Demo analysis — keyword based, run entirely in your browser. Your resume text is not uploaded.">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-8 text-center hover:border-primary/50">
              <Upload className="size-5 text-primary" />
              <span className="text-sm font-medium">{profile?.resume_name || "Attach your resume file"}</span>
              <span className="text-xs text-muted-foreground">PDF, DOC or DOCX up to 5 MB — the file name is saved to your profile only</span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { toast.error("That file is larger than 5 MB"); return; }
                  update.mutate({ resume_name: file.name });
                  toast.success("Resume attached");
                }}
              />
            </label>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="resume-text">Paste your resume text</label>
              <Textarea id="resume-text" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text of your resume here…" />
            </div>
            <Button onClick={analyze}><FileText className="mr-1 size-4" /> Analyse resume</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            {!result ? (
              <p className="text-sm text-muted-foreground">Your resume strength score and keyword coverage will appear here.</p>
            ) : (
              <>
                <div>
                  <p className="font-display text-3xl font-bold">{result.score}/100</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Demo resume strength</p>
                  <Progress value={result.score} className="mt-2" aria-label="Resume strength" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Keywords found ({result.found.length})</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{result.found.join(", ") || "No recognised skill keywords found."}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">On your profile but missing from the resume</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{result.missing.join(", ") || "Everything on your profile appears in the resume."}</p>
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Suggested improvements</h2>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Lead each bullet with an action verb and a measurable result.</li>
                    <li>Mirror the exact skill words used in the opportunities you target.</li>
                    <li>Keep it to one page with clear Education, Projects and Experience sections.</li>
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {recommended.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-base font-semibold">Opportunities matching your resume keywords</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((o) => <OpportunityCard key={o.id} opportunity={o} match={o.match} />)}
          </div>
        </section>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Want richer matches? <Link to="/onboarding" className="underline">Update your profile</Link>.
      </p>
    </AppLayout>
  );
}
