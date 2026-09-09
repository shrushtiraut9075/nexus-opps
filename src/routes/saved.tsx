import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunityFilters, EMPTY_FILTERS, applyFilters, type Filters } from "@/components/OpportunityFilters";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useSaved, useToggleSave } from "@/hooks/useProfile";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved opportunities — OpportunityX" },
      { name: "description", content: "Everything you have bookmarked on OpportunityX, ready to filter, revisit and apply to." },
      { property: "og:title", content: "Saved opportunities — OpportunityX" },
      { property: "og:description", content: "Everything you have bookmarked on OpportunityX, ready to filter, revisit and apply to." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { scored } = useScoredOpportunities();
  const { data: saved, isLoading } = useSaved();
  const toggleSave = useToggleSave();
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, sort: "match" });

  const ids = new Set((saved ?? []).map((s) => s.opportunity_id));
  const items = applyFilters(scored.filter((o) => ids.has(o.id)), filters, (o) => o.match.score);

  return (
    <AppLayout title="My Saved Opportunities" subtitle={`${ids.size} saved`}>
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : ids.size === 0 ? (
        <EmptyState
          icon={<Bookmark className="size-6" />}
          title="You haven't saved any opportunities yet."
          description="Save anything that looks interesting and it will appear here."
          action={<Button asChild><Link to="/opportunities">Explore Opportunities</Link></Button>}
        />
      ) : (
        <>
          <OpportunityFilters filters={filters} onChange={setFilters} />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} match={o.match} saved onToggleSave={() => toggleSave.mutate({ opportunityId: o.id, saved: true })} />
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
