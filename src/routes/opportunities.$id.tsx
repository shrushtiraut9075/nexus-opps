import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, CalendarClock, Check, ExternalLink, MapPin, Share2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AutoLayout } from "@/components/AppLayout";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { useAuth } from "@/hooks/useAuth";
import { useApplications, useToggleSave, useUpsertApplication } from "@/hooks/useProfile";
import { APPLICATION_STATUSES, deadlineLabel } from "@/lib/matching";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({
    meta: [
      { title: "Opportunity details — OpportunityX" },
      { name: "description", content: "Full details, eligibility, required skills and a transparent match explanation for this student opportunity." },
      { property: "og:title", content: "Opportunity details — OpportunityX" },
      { property: "og:description", content: "Full details, eligibility, required skills and a transparent match explanation for this student opportunity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { scored, savedIds, isLoading } = useScoredOpportunities();
  const toggleSave = useToggleSave();
  const upsert = useUpsertApplication();
  const { data: applications } = useApplications();

  const o = scored.find((x) => x.id === id);
  const application = (applications ?? []).find((a) => a.opportunity_id === id);
  const similar = scored.filter((x) => x.id !== id && x.category === o?.category).slice(0, 3);

  if (isLoading) {
    return (
      <AutoLayout title="Opportunity">
        <Skeleton className="h-96 rounded-xl" />
      </AutoLayout>
    );
  }

  if (!o) {
    return (
      <AutoLayout title="Opportunity not found" subtitle="This opportunity may have been removed.">
        <Button asChild><Link to="/opportunities">Back to explore</Link></Button>
      </AutoLayout>
    );
  }

  const saved = savedIds.has(o.id);

  return (
    <AutoLayout title={o.title} subtitle={o.organization}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{o.category}</Badge>
                {o.is_premium ? <Badge>Premium</Badge> : <Badge variant="outline">Free</Badge>}
                {o.is_demo && <Badge variant="outline">Demo data</Badge>}
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {o.location} · {o.work_mode}</span>
                <span className="inline-flex items-center gap-1"><CalendarClock className="size-4" /> {deadlineLabel(o.deadline)}</span>
                <span>{o.experience_level} level</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed">{o.description}</p>
              {o.eligibility && <Block title="Eligibility" body={o.eligibility} />}
              {o.education_requirement && <Block title="Education requirement" body={o.education_requirement} />}
              {o.benefits && <Block title="Benefits" body={o.benefits} />}
              {o.application_process && <Block title="Application process" body={o.application_process} />}
              <div>
                <h2 className="text-sm font-semibold">Required skills</h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.required_skills.map((s) => (
                    <span key={s} className={`rounded-full border px-2.5 py-0.5 text-xs ${o.match.matchedSkills.includes(s) ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground"}`}>{s}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {similar.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-semibold">Similar opportunities</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {similar.map((s) => <OpportunityCard key={s.id} opportunity={s} match={s.match} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="font-display text-3xl font-bold">{o.match.score}%</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Demo match score</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold">Why this matches you</h2>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {o.match.reasons.map((r) => (
                    <li key={r.text} className="flex items-start gap-2">
                      {r.ok ? <Check className="mt-0.5 size-4 shrink-0 text-success" /> : <X className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                      <span className={r.ok ? "" : "text-muted-foreground"}>{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {o.match.missingSkills.length > 0 && (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                  <p className="font-medium">Skill gap</p>
                  <p className="mt-1 text-muted-foreground">{o.match.missingSkills.join(", ")}</p>
                  <Button asChild variant="link" className="h-auto p-0 text-sm"><Link to="/skill-gap">Plan how to close it</Link></Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Scores come from a transparent rule-based demo engine, not a verified AI model.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              {o.apply_url ? (
                <Button asChild className="w-full">
                  <a href={o.apply_url} target="_blank" rel="noopener noreferrer">Apply Now <ExternalLink className="ml-1 size-4" /></a>
                </Button>
              ) : (
                <Button className="w-full" disabled>Application link unavailable</Button>
              )}
              {user && (
                <>
                  <Button variant="outline" className="w-full" onClick={() => toggleSave.mutate({ opportunityId: o.id, saved })}>
                    {saved ? <><BookmarkCheck className="mr-1 size-4" /> Saved</> : <><Bookmark className="mr-1 size-4" /> Save Opportunity</>}
                  </Button>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="status">Application status</label>
                    <Select
                      value={application?.status ?? ""}
                      onValueChange={(v) => upsert.mutate({ opportunityId: o.id, status: v }, { onSuccess: () => toast.success(`Marked as ${v}`) })}
                    >
                      <SelectTrigger id="status"><SelectValue placeholder="Track this opportunity" /></SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied");
                  }
                }}
              >
                <Share2 className="mr-1 size-4" /> Share
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AutoLayout>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
