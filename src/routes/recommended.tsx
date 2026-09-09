import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useToggleSave } from "@/hooks/useProfile";

export const Route = createFileRoute("/recommended")({
  head: () => ({
    meta: [
      { title: "Recommended for you — OpportunityX" },
      { name: "description", content: "Opportunities ranked by your transparent demo match score, highest first." },
      { property: "og:title", content: "Recommended for you — OpportunityX" },
      { property: "og:description", content: "Opportunities ranked by your transparent demo match score, highest first." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RecommendedPage,
});

function RecommendedPage() {
  const { scored, savedIds, isLoading } = useScoredOpportunities();
  const toggleSave = useToggleSave();
  const ranked = [...scored].sort((a, b) => b.match.score - a.match.score);

  return (
    <AppLayout title="Recommended for you" subtitle="Ranked by your demo match score — highest first.">
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0,1,2,3,4,5].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
      ) : ranked.length === 0 ? (
        <EmptyState title="No recommendations yet" description="Complete your profile to improve your recommendations." action={<Button asChild><Link to="/onboarding">Complete profile</Link></Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ranked.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} match={o.match} saved={savedIds.has(o.id)} onToggleSave={() => toggleSave.mutate({ opportunityId: o.id, saved: savedIds.has(o.id) })} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
