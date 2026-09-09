import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Bookmark, Briefcase, CalendarClock, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useApplications, useSaved, useToggleSave } from "@/hooks/useProfile";
import { daysUntil, profileCompletion } from "@/lib/matching";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — OpportunityX" },
      { name: "description", content: "Your personalised opportunity matches, deadlines and application progress on OpportunityX." },
      { property: "og:title", content: "Dashboard — OpportunityX" },
      { property: "og:description", content: "Personalised matches, deadlines and application progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { scored, savedIds, profile, isLoading, isError } = useScoredOpportunities();
  const { data: applications } = useApplications();
  const { data: saved } = useSaved();
  const toggleSave = useToggleSave();

  const completion = profileCompletion(profile as unknown as Record<string, unknown>);
  const ranked = [...scored].sort((a, b) => b.match.score - a.match.score);
  const top = ranked.slice(0, 6);
  const best = ranked[0];
  const skillsMatched = new Set(ranked.slice(0, 10).flatMap((o) => o.match.matchedSkills)).size;
  const upcoming = scored.filter((o) => {
    const d = daysUntil(o.deadline);
    return d !== null && d >= 0 && d <= 14;
  });

  return (
    <AppLayout
      title={`Hi, ${profile?.full_name?.split(" ")[0] ?? "there"} 👋`}
      subtitle="Here are opportunities selected for you."
      actions={
        <Button asChild size="sm">
          <Link to="/opportunities">Explore</Link>
        </Button>
      }
    >
      {completion < 100 && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-medium">Profile {completion}% complete</p>
              <Progress value={completion} className="mt-2" aria-label="Profile completion" />
              <p className="mt-2 text-xs text-muted-foreground">
                A fuller profile gives you sharper matches and fewer irrelevant results.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/onboarding">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Sparkles} label="Best match" value={best ? `${best.match.score}%` : "—"} hint={best?.title ?? "Add skills to match"} />
        <Stat icon={Target} label="Recommended" value={String(ranked.filter((o) => o.match.score >= 60).length)} hint="opportunities above 60% match" />
        <Stat icon={Bookmark} label="Saved" value={String(saved?.length ?? 0)} hint="opportunities in your list" />
        <Stat icon={Briefcase} label="Applications" value={String(applications?.length ?? 0)} hint="tracked in your pipeline" />
      </div>

      {upcoming.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <CalendarClock className="size-4 text-primary" /> Deadlines in the next two weeks
              </h2>
              <Button asChild variant="ghost" size="sm">
                <Link to="/deadlines">
                  View all <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {upcoming.slice(0, 4).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <Link to="/opportunities/$id" params={{ id: o.id }} className="truncate hover:underline">
                    {o.title}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {daysUntil(o.deadline)} days left
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Your personalised feed</h2>
            <p className="text-xs text-muted-foreground">
              Demo rule-based matching — scores are computed from your profile, not an external AI model.
              {skillsMatched > 0 && ` ${skillsMatched} of your skills were matched.`}
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/recommended">
              See all <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<AlertCircle className="size-6" />}
            title="We couldn't load opportunities"
            description="Check your connection and try again."
          />
        ) : top.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Complete your profile to improve your recommendations."
            action={
              <Button asChild>
                <Link to="/onboarding">Complete profile</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {top.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                match={o.match}
                saved={savedIds.has(o.id)}
                onToggleSave={() => toggleSave.mutate({ opportunityId: o.id, saved: savedIds.has(o.id) })}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="size-3.5 text-primary" /> {label}
        </div>
        <p className="mt-2 font-display text-2xl font-bold">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
