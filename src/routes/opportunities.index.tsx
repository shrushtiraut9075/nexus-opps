import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AutoLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunityFilters, EMPTY_FILTERS, applyFilters, type Filters } from "@/components/OpportunityFilters";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useAuth } from "@/hooks/useAuth";
import { useToggleSave } from "@/hooks/useProfile";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Explore Opportunities — OpportunityX" },
      { name: "description", content: "Search and filter internships, scholarships, hackathons, fellowships, competitions and more for students." },
      { property: "og:title", content: "Explore Opportunities — OpportunityX" },
      { property: "og:description", content: "Search and filter internships, scholarships, hackathons, fellowships, competitions and more for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

const PAGE = 9;

function ExplorePage() {
  const { user } = useAuth();
  const { scored, savedIds, isLoading, isError } = useScoredOpportunities();
  const toggleSave = useToggleSave();
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS, sort: "match" });
  const [count, setCount] = useState(PAGE);

  const results = applyFilters(scored, filters, (o) => o.match.score);
  const visible = results.slice(0, count);

  return (
    <AutoLayout title="Explore Opportunities" subtitle="Every opportunity here is clearly-labelled sample data for this demo.">
      <OpportunityFilters filters={filters} onChange={(f) => { setFilters(f); setCount(PAGE); }} />

      <p className="mt-4 text-sm text-muted-foreground">{results.length} opportunities</p>

      {isLoading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : isError ? (
        <div className="mt-4">
          <EmptyState icon={<AlertCircle className="size-6" />} title="We couldn't load opportunities" description="Please check your connection and try again." />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No opportunities match those filters" description="Try clearing a filter or searching for something broader." action={<Button variant="outline" onClick={() => setFilters({ ...EMPTY_FILTERS, sort: filters.sort })}>Clear filters</Button>} />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                match={o.match}
                {...(user ? { saved: savedIds.has(o.id), onToggleSave: () => toggleSave.mutate({ opportunityId: o.id, saved: savedIds.has(o.id) }) } : {})}
              />
            ))}
          </div>
          {count < results.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => setCount((c) => c + PAGE)}>Load more</Button>
            </div>
          )}
        </>
      )}
    </AutoLayout>
  );
}
