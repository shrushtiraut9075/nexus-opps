import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/AppLayout";
import { useScoredOpportunities } from "@/hooks/useMatches";
import { deadlineLabel } from "@/lib/matching";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI assistant — OpportunityX" },
      { name: "description", content: "Ask the OpportunityX assistant about matches, eligibility, skill gaps and application checklists." },
      { property: "og:title", content: "AI assistant — OpportunityX" },
      { property: "og:description", content: "Ask the OpportunityX assistant about matches, eligibility, skill gaps and application checklists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Which opportunities suit my skills?",
  "What deadlines are coming up?",
  "What skills am I missing?",
  "Give me an application checklist",
];

function AssistantPage() {
  const { scored, profile } = useScoredOpportunities();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm the OpportunityX assistant. I answer from the sample opportunity database and your profile — I'm a rule-based demo, not a live AI model. Ask me about matches, deadlines, eligibility or skill gaps." },
  ]);
  const [input, setInput] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const ranked = [...scored].sort((a, b) => b.match.score - a.match.score);

  const answer = (q: string): string => {
    const t = q.toLowerCase();
    if (!ranked.length) return "I don't have any opportunities loaded yet. Try again in a moment.";
    if (t.includes("deadline")) {
      const soon = ranked.filter((o) => o.deadline).slice(0, 5);
      return "Deadlines coming up:\n" + soon.map((o) => `• ${o.title} — ${deadlineLabel(o.deadline)}`).join("\n");
    }
    if (t.includes("skill") && (t.includes("miss") || t.includes("gap") || t.includes("learn"))) {
      const gaps = [...new Set(ranked.slice(0, 8).flatMap((o) => o.match.missingSkills))].slice(0, 6);
      return gaps.length
        ? "Across your strongest matches, these skills come up most often and are missing from your profile:\n" + gaps.map((s) => `• ${s}`).join("\n")
        : "Your profile covers the skills required by your strongest matches.";
    }
    if (t.includes("checklist") || t.includes("prepare") || t.includes("apply")) {
      const top = ranked[0];
      return `Application checklist for ${top?.title}:\n• Re-read the eligibility criteria\n• Update your resume with the required skills (${top?.required_skills.slice(0, 3).join(", ")})\n• Prepare a short statement of purpose\n• Collect proof of education (marksheet / ID)\n• Submit before ${deadlineLabel(top?.deadline)}`;
    }
    if (t.includes("eligib")) {
      const top = ranked[0];
      return `${top?.title} asks for: ${top?.eligibility || top?.education_requirement || "no specific eligibility listed"}. Based on your profile, your match score is ${top?.match.score}%.`;
    }
    const keyword = t.split(/\s+/).find((w) => w.length > 3);
    const hits = keyword ? ranked.filter((o) => `${o.title} ${o.category} ${o.required_skills.join(" ")}`.toLowerCase().includes(keyword)) : [];
    const list = (hits.length ? hits : ranked).slice(0, 4);
    return `Based on your profile${profile?.target_role ? ` (target role: ${profile.target_role})` : ""}, these look strongest:\n` +
      list.map((o) => `• ${o.title} — ${o.organization} · ${o.match.score}% match · ${deadlineLabel(o.deadline)}`).join("\n");
  };

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: answer(q) }]);
    setInput("");
    setTimeout(() => boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight }), 50);
  };

  return (
    <AppLayout title="OpportunityX AI Assistant" subtitle="Grounded in the sample opportunity database — demo assistant, not a live AI model.">
      <Card>
        <CardContent className="p-0">
          <div ref={boxRef} className="max-h-[55vh] space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
                <div className={m.role === "user" ? "max-w-[80%] whitespace-pre-line rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground" : "max-w-[85%] whitespace-pre-line text-sm"}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Ask about opportunities, eligibility or skills…"
                aria-label="Message the assistant"
              />
              <Button onClick={() => send(input)} aria-label="Send"><Send className="size-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
