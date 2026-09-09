import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About OpportunityX — Student Opportunity Engine" },
      { name: "description", content: "Why we built OpportunityX: one place for students to discover, match with and track internships, scholarships and hackathons." },
      { property: "og:title", content: "About OpportunityX" },
      { property: "og:description", content: "Why we built OpportunityX for students across India." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { title: "Transparent matching", body: "Every match score shows the exact reasons behind it — skills, interests, education, mode. No black box." },
  { title: "Built for students", body: "Tier-2 and tier-3 college students miss out because information is scattered. We bring it together." },
  { title: "Honest about demo data", body: "The opportunities you see are realistic samples used to demonstrate the product end to end." },
];

function AboutPage() {
  return (
    <PublicLayout>
      <PageHeader
        title="About OpportunityX"
        subtitle="Discover. Match. Apply. Grow. — one engine for every student opportunity."
      />
      <section className="mx-auto max-w-4xl space-y-10 px-4 py-14 sm:px-6">
        <div className="space-y-4 text-muted-foreground">
          <p>
            Thousands of internships, scholarships, hackathons and fellowships open every month, yet most students
            hear about them too late. OpportunityX collects them in one catalogue and ranks them against your own
            profile so the right ones surface first.
          </p>
          <p>
            The matching engine is a transparent, rule-based scorer. It weighs your skills (40%), career interests
            (20%), education (15%), experience level (10%), preferences (10%) and work mode (5%), then explains
            every point it awarded — including the skills you are missing and how to close the gap.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {VALUES.map((v) => (
            <Card key={v.title}>
              <CardContent className="space-y-2 p-6">
                <h2 className="font-display text-base font-semibold">{v.title}</h2>
                <p className="text-sm text-muted-foreground">{v.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild><Link to="/auth">Get started free</Link></Button>
          <Button variant="outline" asChild><Link to="/opportunities">Explore opportunities</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
