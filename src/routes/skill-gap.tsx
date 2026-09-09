import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { useScoredOpportunities } from "@/hooks/useMatches";

export const Route = createFileRoute("/skill-gap")({
  head: () => ({
    meta: [
      { title: "Skill gap analyzer — OpportunityX" },
      { name: "description", content: "Compare your skills against a target opportunity and see exactly what to learn next." },
      { property: "og:title", content: "Skill gap analyzer — OpportunityX" },
      { property: "og:description", content: "Compare your skills against a target opportunity and see exactly what to learn next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkillGapPage,
});

function SkillGapPage() {
  const { scored, profile } = useScoredOpportunities();
  const ranked = [...scored].sort((a, b) => b.match.score - a.match.score);
  const [targetId, setTargetId] = useState<string>("");
  const target = ranked.find((o) => o.id === targetId) ?? ranked[0];
  const mySkills = profile?.skills ?? [];

  const aggregate = new Map<string, number>();
  ranked.slice(0, 12).forEach((o) => o.match.missingSkills.forEach((s) => aggregate.set(s, (aggregate.get(s) ?? 0) + 1)));
  const topGaps = [...aggregate.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (!target) {
    return (
      <AppLayout title="AI Skill Gap Analyzer">
        <EmptyState title="Nothing to compare yet" description="Add skills to your profile to run an analysis." action={<Button asChild><Link to="/onboarding">Complete profile</Link></Button>} />
      </AppLayout>
    );
  }

  const covered = target.required_skills.length
    ? Math.round((target.match.matchedSkills.length / target.required_skills.length) * 100)
    : 100;

  return (
    <AppLayout title="AI Skill Gap Analyzer" subtitle="Rule-based comparison of your profile against a target opportunity.">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="max-w-md space-y-1.5">
            <label className="text-sm font-medium" htmlFor="target">Target opportunity</label>
            <Select value={target.id} onValueChange={setTargetId}>
              <SelectTrigger id="target"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ranked.slice(0, 25).map((o) => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm font-medium">Skill coverage: {covered}%</p>
            <Progress value={covered} className="mt-2" aria-label="Skill coverage" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold">Skills you already have</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {target.match.matchedSkills.length === 0 && <li className="text-muted-foreground">None matched yet</li>}
                {target.match.matchedSkills.map((s) => (
                  <li key={s} className="flex items-center gap-2"><Check className="size-4 text-success" /> {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold">Skills to improve</h2>
              <ul className="mt-2 space-y-3 text-sm">
                {target.match.missingSkills.length === 0 && <li className="text-muted-foreground">You cover every listed skill.</li>}
                {target.match.missingSkills.map((s) => (
                  <li key={s} className="rounded-lg border border-border p-3">
                    <p className="flex items-center gap-2 font-medium"><X className="size-4 text-warning" /> {s}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Importance: required for this opportunity · Your level: not listed on your profile</p>
                    <p className="mt-1 text-xs text-muted-foreground">Next step: build one small project using {s} and add it to your profile.</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {topGaps.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="font-display text-base font-semibold">Most requested skills you are missing</h2>
            <p className="text-xs text-muted-foreground">Across your top matches. You currently list {mySkills.length} skills.</p>
            <ul className="mt-3 space-y-2 text-sm">
              {topGaps.map(([skill, count]) => (
                <li key={skill} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span>{skill}</span>
                  <span className="text-xs text-muted-foreground">asked for in {count} opportunities</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
