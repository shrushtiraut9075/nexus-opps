import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PublicLayout, PageHeader } from "@/components/PublicLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact OpportunityX — Talk to the Team" },
      { name: "description", content: "Questions about matching, premium or listing an opportunity? Send the OpportunityX team a message." },
      { property: "og:title", content: "Contact OpportunityX" },
      { property: "og:description", content: "Send the OpportunityX team a message." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PublicLayout>
      <PageHeader title="Contact us" subtitle="We reply to student questions within two working days." />
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="space-y-3 py-8 text-center">
                <MessageSquare className="mx-auto size-10 text-primary" />
                <h2 className="font-display text-lg font-semibold">Message received</h2>
                <p className="text-sm text-muted-foreground">
                  Thanks for writing in. This is a demo form, so nothing was actually emailed.
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>Send another</Button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  toast.success("Message sent (demo)");
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" required placeholder="Aarav Sharma" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="you@college.edu" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required placeholder="Question about premium matching" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" required rows={6} placeholder="Tell us what you need help with…" />
                </div>
                <Button type="submit">Send message</Button>
                <p className="text-xs text-muted-foreground">Demo form — messages are not delivered.</p>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">hello@opportunityx.demo</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-primary" />
                <div>
                  <p className="font-medium">Based in</p>
                  <p className="text-muted-foreground">Pune, India — serving students nationwide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
