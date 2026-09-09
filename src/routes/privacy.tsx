import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — OpportunityX" },
      { name: "description", content: "How OpportunityX handles student profile data, resumes, applications and notification consent." },
      { property: "og:title", content: "Privacy Policy — OpportunityX" },
      { property: "og:description", content: "How we handle student profile data and consent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const SECTIONS = [
  { h: "What we store", p: "Your account email, the profile details you enter during onboarding, the opportunities you save, and the applications you track. Resume files are analysed in your browser; only the file name is stored." },
  { h: "Who can see it", p: "Only you. Database rules restrict every profile, saved item, application and notification row to its owner. Administrators can see aggregate counts and the opportunity catalogue." },
  { h: "Notifications", p: "Email and deadline reminders are off unless you switch them on in Settings. You can turn them off again at any time." },
  { h: "Third parties", p: "Sign-in can be done with Google, in which case Google shares your email address with us. We do not sell or share your data with advertisers." },
  { h: "Deleting your data", p: "Ask us from the Contact page and your account and all associated rows are removed." },
  { h: "Demo notice", p: "This is a demonstration product. Opportunities shown are realistic sample records, not live listings." },
];

function PrivacyPage() {
  return (
    <PublicLayout>
      <PageHeader title="Privacy Policy" subtitle="Plain-language summary of what we collect and why." />
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:px-6">
        {SECTIONS.map((s) => (
          <div key={s.h} className="space-y-2">
            <h2 className="font-display text-lg font-semibold">{s.h}</h2>
            <p className="text-sm text-muted-foreground">{s.p}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
