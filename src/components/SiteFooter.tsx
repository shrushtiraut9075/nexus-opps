import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            AI-powered student opportunity engine. Discover. Match. Apply. Grow.
          </p>
          <div className="flex gap-3 pt-1">
            <a href="https://twitter.com" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
              <Twitter className="size-5" />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="size-5" />
            </a>
            <a href="https://github.com" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
              <Github className="size-5" />
            </a>
          </div>
        </div>
        <FooterCol
          title="Product"
          items={[
            { to: "/opportunities", label: "Explore" },
            { to: "/how-it-works", label: "How It Works" },
            { to: "/pricing", label: "Pricing" },
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/help", label: "Help" },
          ]}
        />
        <FooterCol
          title="Legal"
          items={[
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/terms", label: "Terms" },
          ]}
        />
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} OpportunityX. Demo product — opportunities shown are sample data.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
