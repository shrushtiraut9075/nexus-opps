import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Briefcase, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { useApplications, useDeleteApplication, useUpsertApplication } from "@/hooks/useProfile";
import { APPLICATION_STATUSES, deadlineLabel } from "@/lib/matching";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Application tracker — OpportunityX" },
      { name: "description", content: "Track every opportunity you are pursuing across eight pipeline stages, with deadlines and notes." },
      { property: "og:title", content: "Application tracker — OpportunityX" },
      { property: "og:description", content: "Track every opportunity you are pursuing across eight pipeline stages, with deadlines and notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { data: applications, isLoading } = useApplications();
  const upsert = useUpsertApplication();
  const remove = useDeleteApplication();
  const [notesFor, setNotesFor] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const rows = applications ?? [];

  if (isLoading) {
    return <AppLayout title="My Applications"><Skeleton className="h-64 rounded-xl" /></AppLayout>;
  }

  if (rows.length === 0) {
    return (
      <AppLayout title="My Applications">
        <EmptyState
          icon={<Briefcase className="size-6" />}
          title="Start tracking your applications here."
          description="Set a status on any opportunity and it will show up in this pipeline."
          action={<Button asChild><Link to="/opportunities">Explore Opportunities</Link></Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Applications" subtitle={`${rows.length} tracked`}>
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Pipeline</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {APPLICATION_STATUSES.map((status) => {
              const items = rows.filter((r) => r.status === status);
              return (
                <div key={status} className="w-64 shrink-0">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{status}</h2>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  <div className="space-y-2 rounded-lg bg-muted/50 p-2">
                    {items.length === 0 && <p className="p-3 text-xs text-muted-foreground">Nothing here yet</p>}
                    {items.map((r) => (
                      <Card key={r.id}>
                        <CardContent className="space-y-2 p-3">
                          <Link to="/opportunities/$id" params={{ id: r.opportunity_id }} className="block text-sm font-medium hover:underline">
                            {r.opportunities?.title ?? "Opportunity"}
                          </Link>
                          <p className="text-xs text-muted-foreground">{r.opportunities?.organization}</p>
                          <p className="text-xs text-muted-foreground">{deadlineLabel(r.opportunities?.deadline)}</p>
                          <Select value={r.status} onValueChange={(v) => upsert.mutate({ opportunityId: r.opportunity_id, status: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link to="/opportunities/$id" params={{ id: r.opportunity_id }} className="font-medium hover:underline">
                        {r.opportunities?.title ?? "Opportunity"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.opportunities?.organization}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => upsert.mutate({ opportunityId: r.opportunity_id, status: v })}>
                        <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{deadlineLabel(r.opportunities?.deadline)}</TableCell>
                    <TableCell>
                      {notesFor === r.id ? (
                        <div className="flex gap-2">
                          <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} className="h-8" aria-label="Note" />
                          <Button
                            size="sm"
                            onClick={() => {
                              upsert.mutate(
                                { opportunityId: r.opportunity_id, status: r.status, notes: noteDraft },
                                { onSuccess: () => { setNotesFor(null); toast.success("Note saved"); } },
                              );
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <button className="text-left text-sm text-muted-foreground hover:text-foreground" onClick={() => { setNotesFor(r.id); setNoteDraft(r.notes ?? ""); }}>
                          {r.notes || "Add a note"}
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" aria-label="Remove from tracker" onClick={() => remove.mutate(r.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
