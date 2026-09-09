import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookMarked,
  Briefcase,
  CalendarClock,
  Compass,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, useNotifications, useProfile } from "@/hooks/useProfile";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/opportunities", label: "Explore", icon: Compass },
  { to: "/recommended", label: "Recommended", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: BookMarked },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/deadlines", label: "Deadlines", icon: CalendarClock },
  { to: "/skill-gap", label: "Skill Gap", icon: Target },
  { to: "/roadmap", label: "Career Roadmap", icon: Map },
  { to: "/resume-analyzer", label: "Resume Analyzer", icon: FileText },
  { to: "/assistant", label: "AI Assistant", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/pricing", label: "Pricing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsAdmin();
  const { data: notifications } = useNotifications();
  const { data: profile } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = (notifications ?? []).filter((n) => !n.is_read).length;

  if (!loading && !user) {
    if (typeof window !== "undefined") navigate({ to: "/auth", search: { mode: "login" } });
    return null;
  }

  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Student portal">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {item.to === "/notifications" && unread > 0 && (
              <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          to="/admin"
          onClick={() => setOpen(false)}
          className="mt-2 flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Shield className="size-4" /> Admin Portal
        </Link>
      )}
      <button
        onClick={async () => {
          await signOut();
          navigate({ to: "/" });
        }}
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      >
        <LogOut className="size-4" /> Logout
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
        <div className="px-2 pb-4">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{profile?.plan === "premium" ? "Premium plan" : "Free plan"}</p>
          <p className="mt-1">Demo data — sample opportunities.</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <button
            className="inline-flex size-10 items-center justify-center rounded-md lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>

        {open && (
          <div className="border-b border-border bg-card p-4 lg:hidden">{nav}</div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
