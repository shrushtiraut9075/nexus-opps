import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How OpportunityX Works — 6 Steps to Your Next Opportunity" },
      { name: "description", content: "Create a profile, get matched, explore, save, apply and track — see how OpportunityX guides students end to end." },
      { property: "og:title", content: "How OpportunityX Works" },
      { property: "og:description", content: "Six steps from sign up to a tracked application." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksPage,
});

const STEPS = [
  { title: "Create your account", body: "Sign up with email or Google. Your data stays private to you." },
  { title: "Complete onboarding", body: "Eight quick steps: education, skills, interests, goals, experience and resume." },
  { title: "Get matched", body: "The engine scores every opportunity against your profile and explains each score." },
  { title: "Explore and filter", body: "Search the full catalogue by category, mode, experience level, skills and location." },
  { title: "Save and apply", body: "Shortlist what fits, open the official application link and record your notes." },
  { title: "Track and grow", body: "Move applications across the pipeline, watch deadlines and close your skill gaps." },
];

function HowItWorksPage() {
  return (
    <PublicLayout>
      <PageHeader title="How it works" subtitle="From sign up to a tracked application in six steps." />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full">
                <CardContent className="space-y-2 p-6">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <h2 className="font-display text-base font-semibold">{s.title}</h2>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild><Link to="/auth">Start now</Link></Button>
          <Button variant="outline" asChild><Link to="/pricing">See pricing</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
