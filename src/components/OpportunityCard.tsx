import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, CalendarClock, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deadlineLabel, type MatchResult } from "@/lib/matching";
import type { Opportunity } from "@/hooks/useProfile";

export function MatchRing({ score }: { score: number }) {
  const tone = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : "text-muted-foreground";
  return (
    <div className={`flex flex-col items-center ${tone}`} title="Demo rule-based match score">
      <span className="font-display text-xl font-bold leading-none">{score}%</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">match</span>
    </div>
  );
}

export function OpportunityCard({
  opportunity,
  match,
  saved,
  onToggleSave,
}: {
  opportunity: Opportunity;
  match?: MatchResult;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-elevate">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{opportunity.category}</Badge>
              {opportunity.is_premium ? <Badge>Premium</Badge> : <Badge variant="outline">Free</Badge>}
              {opportunity.is_demo && <Badge variant="outline">Demo data</Badge>}
            </div>
            <h3 className="mt-2 truncate text-base font-semibold">{opportunity.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{opportunity.organization}</p>
          </div>
          {match && <MatchRing score={match.score} />}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {opportunity.location} · {opportunity.work_mode}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" /> {deadlineLabel(opportunity.deadline)}
          </span>
          <span>{opportunity.experience_level}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {opportunity.required_skills.slice(0, 4).map((s) => {
            const isMatched = match?.matchedSkills.includes(s);
            return (
              <span
                key={s}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  isMatched ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground"
                }`}
              >
                {s}
              </span>
            );
          })}
        </div>

        {match && (
          <p className="inline-flex items-start gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {match.reasons.find((r) => r.ok)?.text ?? "Complete your profile for a better match"}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <Button asChild size="sm" className="flex-1">
            <Link to="/opportunities/$id" params={{ id: opportunity.id }}>
              View Details
            </Link>
          </Button>
          {onToggleSave && (
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleSave}
              aria-label={saved ? "Remove from saved" : "Save opportunity"}
            >
              {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
