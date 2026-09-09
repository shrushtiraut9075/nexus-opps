import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { useMarkNotifications, useNotifications } from "@/hooks/useProfile";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — OpportunityX" },
      { name: "description", content: "Deadline reminders, new matches and application updates in one place." },
      { property: "og:title", content: "Notifications — OpportunityX" },
      { property: "og:description", content: "Deadline reminders, new matches and application updates in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: items, isLoading } = useNotifications();
  const mark = useMarkNotifications();
  const rows = items ?? [];

  return (
    <AppLayout
      title="Notifications"
      actions={rows.some((r) => !r.is_read) ? <Button size="sm" variant="outline" onClick={() => mark.mutate(undefined)}>Mark all as read</Button> : null}
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Bell className="size-6" />} title="No notifications yet" description="Deadline reminders and match updates will show up here." />
      ) : (
        <div className="space-y-2">
          {rows.map((n) => (
            <Card key={n.id} className={n.is_read ? "" : "border-primary/40"}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && <Button size="sm" variant="ghost" onClick={() => mark.mutate(n.id)}>Mark read</Button>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
