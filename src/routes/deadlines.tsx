import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useSaved } from "@/hooks/useProfile";
import { daysUntil, deadlineLabel } from "@/lib/matching";

export const Route = createFileRoute("/deadlines")({
  head: () => ({
    meta: [
      { title: "Deadline reminders — OpportunityX" },
      { name: "description", content: "See what is due today, this week and later across the opportunities you are tracking." },
      { property: "og:title", content: "Deadline reminders — OpportunityX" },
      { property: "og:description", content: "See what is due today, this week and later across the opportunities you are tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DeadlinesPage,
});

function DeadlinesPage() {
  const { scored } = useScoredOpportunities();
  const { data: saved } = useSaved();
  const ids = new Set((saved ?? []).map((s) => s.opportunity_id));
  const relevant = scored.filter((o) => ids.has(o.id) || o.match.score >= 70);

  const groups = [
    { title: "Due today", items: relevant.filter((o) => daysUntil(o.deadline) === 0) },
    { title: "Due this week", items: relevant.filter((o) => { const d = daysUntil(o.deadline); return d !== null && d > 0 && d <= 7; }) },
    { title: "Upcoming", items: relevant.filter((o) => { const d = daysUntil(o.deadline); return d !== null && d > 7; }) },
    { title: "Expired", items: relevant.filter((o) => { const d = daysUntil(o.deadline); return d !== null && d < 0; }) },
  ];

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <AppLayout title="Deadline reminders" subtitle="Saved opportunities plus your strongest matches.">
      {total === 0 ? (
        <EmptyState icon={<CalendarClock className="size-6" />} title="No deadlines to watch yet" description="Save an opportunity and its deadline will appear here." action={<Button asChild><Link to="/opportunities">Explore Opportunities</Link></Button>} />
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="mb-2 font-display text-base font-semibold">{g.title} ({g.items.length})</h2>
              {g.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing here.</p>
              ) : (
                <div className="space-y-2">
                  {g.items.map((o) => (
                    <Card key={o.id}>
                      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <Link to="/opportunities/$id" params={{ id: o.id }} className="font-medium hover:underline">{o.title}</Link>
                          <p className="text-xs text-muted-foreground">{o.organization} · {o.category}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{deadlineLabel(o.deadline)}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Reminder emails are only sent if you turn them on in settings.</p>
    </AppLayout>
  );
}
