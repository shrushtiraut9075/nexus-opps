import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useOpportunities } from "@/hooks/useProfile";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Opportunity = Tables<"opportunities">;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin portal — OpportunityX" },
      { name: "description", content: "Manage OpportunityX opportunities, review platform metrics and student accounts." },
      { property: "og:title", content: "Admin portal — OpportunityX" },
      { property: "og:description", content: "Manage OpportunityX opportunities, review platform metrics and student accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const emptyDraft = {
  title: "",
  organization: "",
  category: "Internship",
  description: "",
  location: "Remote",
  work_mode: "Remote",
  experience_level: "Beginner",
  deadline: "",
  apply_url: "",
  eligibility: "",
  required_skills: "",
  is_premium: false,
  is_published: true,
};

type Draft = typeof emptyDraft;

function AdminPage() {
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: opportunities, isLoading } = useOpportunities();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const stats = useQuery({
    queryKey: ["admin-stats"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const [profiles, applications, saved] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("applications").select("id", { count: "exact", head: true }),
        supabase.from("saved_opportunities").select("id", { count: "exact", head: true }),
      ]);
      return {
        users: profiles.count ?? 0,
        applications: applications.count ?? 0,
        saves: saved.count ?? 0,
      };
    },
  });

  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, college, plan, onboarding_completed, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Draft }) => {
      const payload: TablesInsert<"opportunities"> = {
        title: values.title.trim(),
        organization: values.organization.trim(),
        category: values.category,
        description: values.description.trim(),
        location: values.location.trim() || "Remote",
        work_mode: values.work_mode,
        experience_level: values.experience_level,
        deadline: values.deadline ? values.deadline : null,
        apply_url: values.apply_url.trim() || null,
        eligibility: values.eligibility.trim() || null,
        required_skills: values.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        is_premium: values.is_premium,
        is_published: values.is_published,
      };
      const { error } = id
        ? await supabase.from("opportunities").update(payload).eq("id", id)
        : await supabase.from("opportunities").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      setDraft(null);
      setEditing(null);
      toast.success("Opportunity saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Opportunity> }) => {
      const { error } = await supabase.from("opportunities").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opportunities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success("Opportunity deleted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
  });

  if (roleLoading) {
    return (
      <AppLayout title="Admin portal">
        <Skeleton className="h-64 rounded-xl" />
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout title="Admin portal">
        <EmptyState
          icon={<ShieldAlert className="size-6" />}
          title="Admins only"
          description="This area is restricted to OpportunityX administrators."
          action={<Button asChild><Link to="/dashboard">Back to dashboard</Link></Button>}
        />
      </AppLayout>
    );
  }

  const list = opportunities ?? [];
  const published = list.filter((o) => o.is_published).length;

  const openEdit = (o: Opportunity) => {
    setEditing(o);
    setDraft({
      title: o.title,
      organization: o.organization,
      category: o.category,
      description: o.description,
      location: o.location,
      work_mode: o.work_mode,
      experience_level: o.experience_level,
      deadline: o.deadline ? o.deadline.slice(0, 10) : "",
      apply_url: o.apply_url ?? "",
      eligibility: o.eligibility ?? "",
      required_skills: (o.required_skills ?? []).join(", "),
      is_premium: o.is_premium,
      is_published: o.is_published,
    });
  };

  return (
    <AppLayout title="Admin portal" subtitle="Metrics, opportunity management and student accounts">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Students" value={stats.data?.users ?? 0} />
        <Metric label="Opportunities" value={list.length} />
        <Metric label="Published" value={published} />
        <Metric label="Applications" value={stats.data?.applications ?? 0} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Opportunities</CardTitle>
          <Button size="sm" onClick={() => { setEditing(null); setDraft({ ...emptyDraft }); }}>
            <Plus className="size-4" /> New opportunity
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 rounded-xl" />
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No opportunities yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-2">Title</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Published</th>
                    <th className="py-2">Premium</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="py-2.5 pr-3">
                        <div className="font-medium">{o.title}</div>
                        <div className="text-xs text-muted-foreground">{o.organization}</div>
                      </td>
                      <td className="py-2.5 pr-3"><Badge variant="secondary">{o.category}</Badge></td>
                      <td className="py-2.5 pr-3">
                        <Switch
                          checked={o.is_published}
                          onCheckedChange={(v) => toggleFlag.mutate({ id: o.id, patch: { is_published: v } })}
                          aria-label="Toggle published"
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Switch
                          checked={o.is_premium}
                          onCheckedChange={(v) => toggleFlag.mutate({ id: o.id, patch: { is_premium: v } })}
                          aria-label="Toggle premium"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(o)} aria-label="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { if (confirm(`Delete "${o.title}"?`)) remove.mutate(o.id); }}
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recent students</CardTitle></CardHeader>
        <CardContent>
          {users.isLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (users.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(users.data ?? []).map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <div className="font-medium">{u.full_name ?? "Unnamed student"}</div>
                    <div className="text-xs text-muted-foreground">{u.college ?? "College not set"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.plan === "premium" ? "default" : "secondary"}>{u.plan}</Badge>
                    <Badge variant="outline">{u.onboarding_completed ? "Onboarded" : "Pending setup"}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!draft} onOpenChange={(o) => { if (!o) { setDraft(null); setEditing(null); } }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit opportunity" : "New opportunity"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <Row label="Title"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Row>
              <Row label="Organization"><Input value={draft.organization} onChange={(e) => setDraft({ ...draft, organization: e.target.value })} /></Row>
              <Row label="Category">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  {["Internship", "Scholarship", "Hackathon", "Competition", "Certification", "Fellowship", "Workshop", "Research"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Row>
              <Row label="Description"><Textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Row>
              <div className="grid gap-3 sm:grid-cols-2">
                <Row label="Location"><Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Row>
                <Row label="Work mode">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.work_mode}
                    onChange={(e) => setDraft({ ...draft, work_mode: e.target.value })}
                  >
                    {["Remote", "Hybrid", "Onsite"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Row>
                <Row label="Experience level">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.experience_level}
                    onChange={(e) => setDraft({ ...draft, experience_level: e.target.value })}
                  >
                    {["Beginner", "Intermediate", "Advanced"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Row>
                <Row label="Deadline"><Input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} /></Row>
              </div>
              <Row label="Apply URL"><Input value={draft.apply_url} onChange={(e) => setDraft({ ...draft, apply_url: e.target.value })} /></Row>
              <Row label="Eligibility"><Textarea rows={2} value={draft.eligibility} onChange={(e) => setDraft({ ...draft, eligibility: e.target.value })} /></Row>
              <Row label="Required skills (comma separated)">
                <Input value={draft.required_skills} onChange={(e) => setDraft({ ...draft, required_skills: e.target.value })} />
              </Row>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} /> Published
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={draft.is_premium} onCheckedChange={(v) => setDraft({ ...draft, is_premium: v })} /> Premium
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDraft(null); setEditing(null); }}>Cancel</Button>
            <Button
              disabled={save.isPending || !draft?.title.trim() || !draft?.organization.trim() || !draft?.description.trim()}
              onClick={() => draft && save.mutate(editing ? { id: editing.id, values: draft } : { values: draft })}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
