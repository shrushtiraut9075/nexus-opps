import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  Check,
  ClipboardList,
  FileSearch,
  Map,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/PublicLayout";
import { PREMIUM_PRICE_INR } from "@/lib/matching";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OpportunityX — Your Next Opportunity Starts Here" },
      {
        name: "description",
        content:
          "AI-powered recommendations connecting students with internships, scholarships, hackathons and career opportunities matched to their goals.",
      },
      { property: "og:title", content: "OpportunityX — Your Next Opportunity Starts Here" },
      {
        property: "og:description",
        content: "Discover. Match. Apply. Grow. Personalised student opportunity matching.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: BrainCircuit, title: "AI Opportunity Matching", desc: "Transparent scoring across skills, interests, eligibility and preferences." },
  { icon: Sparkles, title: "Personalized Feed", desc: "A feed that reshuffles as your profile and goals evolve." },
  { icon: Target, title: "Skill Gap Analysis", desc: "See exactly which skills stand between you and your target role." },
  { icon: BellRing, title: "Deadline Alerts", desc: "Never miss a closing date with due-today and this-week views." },
  { icon: FileSearch, title: "Resume Recommendations", desc: "Upload a resume and get a strength score plus suggested fixes." },
  { icon: Map, title: "Career Roadmap", desc: "A stage-by-stage path from student to your target career." },
  { icon: ClipboardList, title: "Opportunity Tracking", desc: "Track every application from saved to selected." },
  { icon: Search, title: "Smart Search", desc: "Filter by category, mode, skills, level, location and more." },
];

const steps = [
  { n: "01", t: "Create Profile", d: "Tell us about your education, skills and goals." },
  { n: "02", t: "AI Understands You", d: "Your profile becomes a structured match signal." },
  { n: "03", t: "Match Opportunities", d: "Every listing is scored against your profile." },
  { n: "04", t: "Get Recommendations", d: "See your best matches with clear reasoning." },
  { n: "05", t: "Apply", d: "Jump straight to the official application." },
  { n: "06", t: "Track Progress", d: "Follow each application through to the outcome." },
];

const testimonials = [
  { name: "Aarav Mehta", role: "B.Tech CSE, 3rd year", text: "I stopped scrolling five different sites. The match reasons told me exactly why an internship was worth my time." },
  { name: "Sneha Iyer", role: "BBA, final year", text: "The skill gap view pushed me to finish two certifications before applying. That changed my shortlisting rate." },
  { name: "Rohit Verma", role: "M.Tech, Data Science", text: "The application tracker is the part I use daily. Deadlines stopped slipping past me." },
];

function Landing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-subtle">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5">
              <Sparkles className="size-3.5" /> Discover. Match. Apply. Grow.
            </Badge>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Your Next Opportunity <span className="text-gradient">Starts Here.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              AI-powered recommendations that connect students with internships, scholarships, hackathons,
              competitions and career opportunities matched to their unique goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get Started Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/opportunities">Explore Opportunities</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo product. Opportunity listings are realistic sample data, not verified live postings.
            </p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-destructive/20">
            <CardContent className="p-7">
              <h2 className="font-display text-2xl font-bold">The problem students face</h2>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "Opportunity information is scattered across dozens of sites and groups",
                  "Deadlines are hard to track and quietly pass by",
                  "It is unclear which opportunities actually fit your skills",
                  "Manual searching eats hours every week",
                  "Students rarely know which skill is holding them back",
                ].map((p) => (
                  <li key={p} className="flex gap-3">
                    <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <span className="text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-primary/30 shadow-soft">
            <CardContent className="p-7">
              <h2 className="font-display text-2xl font-bold">How OpportunityX solves it</h2>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "One structured feed across nine opportunity categories",
                  "Deadline views for today, this week and upcoming",
                  "A weighted match score with a plain-English explanation",
                  "Filters and sorting that get you to the right listing in seconds",
                  "Skill gap analysis that names the next skill to learn",
                ].map((p) => (
                  <li key={p} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span className="text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold">Everything you need to go from search to selected</h2>
            <p className="mt-3 text-muted-foreground">
              Career tooling built around one question: what should I do next?
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="h-full transition-transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-soft">
              <span className="font-display text-sm font-bold text-primary">{s.n}</span>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="gradient-hero">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-4">
          {[
            ["24", "Sample opportunities"],
            ["9", "Categories covered"],
            ["6", "Career tools"],
            ["100%", "Explainable matches"],
          ].map(([v, l]) => (
            <div key={l} className="text-center text-primary-foreground">
              <div className="font-display text-4xl font-extrabold">{v}</div>
              <div className="mt-1 text-sm opacity-85">{l}</div>
            </div>
          ))}
        </div>
        <p className="pb-6 text-center text-xs text-primary-foreground/70">
          Platform metrics from the demo database — not real-world usage claims.
        </p>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-bold">What students say</h2>
          <Badge variant="outline">Sample testimonials</Badge>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">“{t.text}”</p>
                <div className="mt-5">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold">Simple pricing</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-7">
                <h3 className="font-semibold">Free</h3>
                <div className="mt-2 font-display text-4xl font-bold">₹0<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {["Basic profile", "Limited recommendations", "Basic search & match score", "Save opportunities", "Application tracker"].map((f) => (
                    <li key={f} className="flex gap-2"><Check className="size-4 text-success" />{f}</li>
                  ))}
                </ul>
                <Button className="mt-7 w-full" variant="outline" asChild>
                  <Link to="/auth" search={{ mode: "signup" }}>Start Free</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary shadow-elevate">
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Premium</h3>
                  <Badge>Most popular</Badge>
                </div>
                <div className="mt-2 font-display text-4xl font-bold">₹{PREMIUM_PRICE_INR}<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  {["Expanded AI recommendations", "Resume analyzer", "Skill gap analyzer", "Career roadmap", "Advanced filters & alerts"].map((f) => (
                    <li key={f} className="flex gap-2"><Check className="size-4 text-success" />{f}</li>
                  ))}
                </ul>
                <Button className="mt-7 w-full" asChild>
                  <Link to="/pricing">Upgrade to Premium</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Stop searching for opportunities. Start discovering the right ones.
        </h2>
        <Button size="lg" className="mt-8" asChild>
          <Link to="/auth" search={{ mode: "signup" }}>
            Get Started Free <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </PublicLayout>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-3xl gradient-hero opacity-15 blur-2xl" aria-hidden="true" />
      <Card className="relative shadow-elevate">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="font-display text-lg font-bold">Hi, Aarav 👋</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="size-3.5" /> 85% profile
            </Badge>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ["12", "Matches"],
              ["4", "Deadlines"],
              ["3", "Applied"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-lg bg-secondary p-3 text-center">
                <div className="font-display text-xl font-bold">{v}</div>
                <div className="text-[11px] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["AI/ML Research Internship", "NeuralGrid Labs", 94],
              ["FinTech Build Sprint", "PayNext", 88],
              ["Women in Tech Scholarship", "TechRise", 81],
            ].map(([title, org, score]) => (
              <div key={title as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <p className="truncate text-xs text-muted-foreground">{org}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full gradient-hero" style={{ width: `${score}%` }} />
                  </div>
                  <span className="w-9 text-right text-xs font-semibold text-primary">{score}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
            <BarChart3 className="size-4 text-primary" />
            Skill gap: add <strong className="mx-1 text-foreground">TensorFlow</strong> to reach 97% on your top match.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
