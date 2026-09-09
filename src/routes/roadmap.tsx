import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useApplications } from "@/hooks/useProfile";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Career roadmap — OpportunityX" },
      { name: "description", content: "A personalised milestone path from student to your target role, with recommended next moves." },
      { property: "og:title", content: "Career roadmap — OpportunityX" },
      { property: "og:description", content: "A personalised milestone path from student to your target role, with recommended next moves." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const { scored, profile } = useScoredOpportunities();
  const { data: applications } = useApplications();
  const ranked = [...scored].sort((a, b) => b.match.score - a.match.score);
  const skills = profile?.skills ?? [];
  const applied = (applications ?? []).filter((a) => a.status !== "Saved" && a.status !== "Interested").length;

  const stages = [
    { title: "Student", detail: "Profile created on OpportunityX", done: !!profile?.full_name },
    { title: "Skill development", detail: `${skills.length} skills listed`, done: skills.length >= 4 },
    { title: "Projects", detail: profile?.projects ? "Projects added to your profile" : "Add at least one project", done: !!profile?.projects },
    { title: "Certifications", detail: "Complete a certification in your target field", done: (profile?.preferred_types ?? []).includes("Certification") },
    { title: "Internship", detail: `${applied} applications submitted`, done: applied > 0 },
    { title: "Advanced opportunity", detail: "Fellowship, research or advanced internship", done: false },
    { title: `Career: ${profile?.target_role || "your target role"}`, detail: "Land the role you're aiming for", done: false },
  ];
  const currentIndex = stages.findIndex((s) => !s.done);

  return (
    <AppLayout title="My Career Roadmap" subtitle={profile?.target_role ? `Target role: ${profile.target_role}` : "Set a target role in your profile for a sharper roadmap."}>
      <ol className="relative space-y-4 border-l border-border pl-6">
        {stages.map((s, i) => (
          <li key={s.title} className="relative">
            <span className={`absolute -left-[31px] flex size-6 items-center justify-center rounded-full border text-xs ${s.done ? "border-success bg-success text-white" : i === currentIndex ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
              {s.done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <Card className={i === currentIndex ? "border-primary/40" : ""}>
              <CardContent className="p-4">
                <p className="font-medium">{s.title}{i === currentIndex && <span className="ml-2 text-xs text-primary">Current stage</span>}</p>
                <p className="text-sm text-muted-foreground">{s.detail}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-base font-semibold">Recommended next moves</h2>
        <div className="space-y-2">
          {ranked.slice(0, 3).map((o) => (
            <Card key={o.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link to="/opportunities/$id" params={{ id: o.id }} className="font-medium hover:underline">{o.title}</Link>
                  <p className="text-xs text-muted-foreground">{o.organization} · {o.match.score}% match</p>
                </div>
                <Button asChild size="sm" variant="outline"><Link to="/opportunities/$id" params={{ id: o.id }}>View</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
