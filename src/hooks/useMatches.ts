import { useMemo } from "react";
import { matchOpportunity, type MatchResult } from "@/lib/matching";
import { useOpportunities, useProfile, useSaved, type Opportunity } from "./useProfile";

export type ScoredOpportunity = Opportunity & { match: MatchResult };

export function useScoredOpportunities() {
  const opportunities = useOpportunities();
  const { data: profile } = useProfile();
  const { data: saved } = useSaved();

  const scored = useMemo<ScoredOpportunity[]>(
    () =>
      (opportunities.data ?? []).map((o) => ({
        ...o,
        match: matchOpportunity(profile, o),
      })),
    [opportunities.data, profile],
  );

  const savedIds = useMemo(
    () => new Set((saved ?? []).map((s) => s.opportunity_id)),
    [saved],
  );

  return {
    scored,
    savedIds,
    profile,
    isLoading: opportunities.isLoading,
    isError: opportunities.isError,
    error: opportunities.error,
  };
}
