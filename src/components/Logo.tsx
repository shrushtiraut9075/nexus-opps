import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-xl gradient-hero shadow-soft`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
        <path d="M5 19 19 5" />
        <path d="M5 5l5.5 5.5" />
        <path d="M13.5 13.5 19 19" />
        <circle cx="12" cy="12" r="1.6" fill="white" stroke="none" />
      </svg>
    </span>
  );
}

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="OpportunityX home">
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">
        Opportunity<span className="text-gradient">X</span>
      </span>
    </Link>
  );
}
