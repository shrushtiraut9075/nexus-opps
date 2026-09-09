import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Centre — OpportunityX FAQs for Students" },
      { name: "description", content: "Answers about match scores, saving opportunities, tracking applications, deadlines, resumes and the premium plan." },
      { property: "og:title", content: "Help Centre — OpportunityX" },
      { property: "og:description", content: "Answers to the most common student questions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  { q: "How is my match score calculated?", a: "Skills contribute 40%, career interests 20%, education 15%, experience level 10%, preferences 10% and work mode 5%. Each opportunity page lists exactly which of these you met and which you missed." },
  { q: "Why is my score low on everything?", a: "Usually the profile is incomplete. Add your skills, interests, preferred opportunity types and experience level in Profile — scores update immediately." },
  { q: "Do you apply on my behalf?", a: "No. We take you to the organiser's official application page and then help you record the application in your tracker." },
  { q: "What do the application statuses mean?", a: "Saved and Interested are shortlists, Applied onward reflect the organiser's process: Shortlisted, Interview, Selected, Rejected or Closed." },
  { q: "Will I get deadline reminders?", a: "Only if you switch reminders on in Settings. The Deadlines page always shows what is due today, this week and later." },
  { q: "Is my resume uploaded anywhere?", a: "No. The resume analyser reads the file in your browser and stores only the file name against your profile." },
  { q: "What does Premium include?", a: "Premium (₹199 per month) unlocks premium-only listings, unlimited tracking and priority matching. Checkout is simulated in this demo build." },
];

function HelpPage() {
  return (
    <PublicLayout>
      <PageHeader title="Help centre" subtitle="Quick answers to the questions students ask most." />
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild><Link to="/contact">Still stuck? Contact us</Link></Button>
          <Button variant="outline" asChild><Link to="/how-it-works">See how it works</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}
