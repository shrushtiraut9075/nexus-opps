import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, EXPERIENCE_LEVELS, SKILL_OPTIONS, WORK_MODES } from "@/lib/matching";

export type Filters = {
  q: string;
  category: string;
  workMode: string;
  experience: string;
  access: string;
  skill: string;
  location: string;
  sort: string;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  category: "all",
  workMode: "all",
  experience: "all",
  access: "all",
  skill: "all",
  location: "",
  sort: "match",
};

export function OpportunityFilters({
  filters,
  onChange,
  showMatchSort = true,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  showMatchSort?: boolean;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search internships, scholarships, hackathons..."
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          aria-label="Search opportunities"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Picker label="Category" value={filters.category} onChange={(v) => set({ category: v })} options={CATEGORIES} />
        <Picker label="Work mode" value={filters.workMode} onChange={(v) => set({ workMode: v })} options={WORK_MODES} />
        <Picker label="Experience" value={filters.experience} onChange={(v) => set({ experience: v })} options={EXPERIENCE_LEVELS} />
        <Picker label="Access" value={filters.access} onChange={(v) => set({ access: v })} options={["Free", "Premium"]} />
        <Picker label="Skill" value={filters.skill} onChange={(v) => set({ skill: v })} options={SKILL_OPTIONS} />
        <div className="space-y-1.5">
          <Label htmlFor="location-filter">Location</Label>
          <Input
            id="location-filter"
            placeholder="e.g. Bengaluru or Remote"
            value={filters.location}
            onChange={(e) => set({ location: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full space-y-1.5 sm:w-56">
          <Label>Sort by</Label>
          <Select value={filters.sort} onValueChange={(v) => set({ sort: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {showMatchSort && <SelectItem value="match">Best Match</SelectItem>}
              <SelectItem value="deadline">Deadline Soon</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

function Picker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function applyFilters<
  T extends {
    title: string;
    organization: string;
    description: string;
    category: string;
    work_mode: string;
    experience_level: string;
    is_premium: boolean;
    required_skills: string[];
    location: string;
    deadline: string | null;
    created_at: string;
    views: number;
  },
>(items: T[], filters: Filters, scoreOf?: (item: T) => number): T[] {
  const q = filters.q.trim().toLowerCase();
  const loc = filters.location.trim().toLowerCase();

  const filtered = items.filter((o) => {
    if (q && ![o.title, o.organization, o.description, o.category, ...o.required_skills].join(" ").toLowerCase().includes(q))
      return false;
    if (filters.category !== "all" && o.category !== filters.category) return false;
    if (filters.workMode !== "all" && o.work_mode !== filters.workMode) return false;
    if (filters.experience !== "all" && o.experience_level !== filters.experience) return false;
    if (filters.access !== "all" && (filters.access === "Premium") !== o.is_premium) return false;
    if (filters.skill !== "all" && !o.required_skills.some((s) => s.toLowerCase() === filters.skill.toLowerCase()))
      return false;
    if (loc && !`${o.location} ${o.work_mode}`.toLowerCase().includes(loc)) return false;
    return true;
  });

  const sorted = [...filtered];
  if (filters.sort === "match" && scoreOf) sorted.sort((a, b) => scoreOf(b) - scoreOf(a));
  else if (filters.sort === "deadline")
    sorted.sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
  else if (filters.sort === "popular") sorted.sort((a, b) => b.views - a.views);
  else sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return sorted;
}
