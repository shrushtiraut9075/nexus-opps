/**
 * OpportunityX demo matching engine.
 *
 * This is a transparent, rule-based scoring algorithm (no external AI model).
 * Every recommendation surfaced through this module must be labelled as a
 * demo / rule-based match, never as a verified AI model output.
 */

export type MatchWeights = {
  skills: number;
  interests: number;
  education: number;
  experience: number;
  workMode: number;
  preferences: number;
};

/** Configurable weights (sum = 100). */
export const DEFAULT_WEIGHTS: MatchWeights = {
  skills: 40,
  interests: 20,
  education: 15,
  experience: 10,
  workMode: 5,
  preferences: 10,
};

export type MatchProfile = {
  skills?: string[] | null;
  interests?: string[] | null;
  preferred_types?: string[] | null;
  experience_level?: string | null;
  work_mode?: string | null;
  target_role?: string | null;
  preferred_industry?: string | null;
  degree?: string | null;
  graduation_year?: string | null;
  city?: string | null;
};

export type MatchOpportunity = {
  id: string;
  title: string;
  category: string;
  required_skills: string[];
  tags?: string[] | null;
  experience_level: string;
  work_mode: string;
  location: string;
  education_requirement?: string | null;
  description?: string | null;
};

export type MatchReason = { ok: boolean; text: string };

export type MatchResult = {
  score: number;
  reasons: MatchReason[];
  matchedSkills: string[];
  missingSkills: string[];
};

const EXPERIENCE_ORDER = ["Beginner", "Intermediate", "Advanced"];

const norm = (v: string) => v.trim().toLowerCase();

const INTEREST_KEYWORDS: Record<string, string[]> = {
  AI: ["ai/ml", "ai", "machine learning", "deep learning", "nlp", "research"],
  FinTech: ["finance", "fintech", "payment", "banking"],
  "Web Development": ["react", "javascript", "node.js", "web", "full-stack"],
  "Data Science": ["data science", "sql", "analyst", "analytics", "python"],
  Cybersecurity: ["cybersecurity", "security"],
  IoT: ["iot", "embedded", "hardware", "smart cities"],
  Business: ["business", "consulting", "case", "strategy"],
  Marketing: ["digital marketing", "marketing", "content", "growth"],
  Research: ["research", "fellowship", "lab", "policy"],
  Design: ["ui/ux", "design", "product design"],
  Entrepreneurship: ["startup", "founder", "entrepreneurship", "venture"],
};

export function matchOpportunity(
  profile: MatchProfile | null | undefined,
  opportunity: MatchOpportunity,
  weights: MatchWeights = DEFAULT_WEIGHTS,
): MatchResult {
  const reasons: MatchReason[] = [];
  const required = opportunity.required_skills ?? [];
  const skills = (profile?.skills ?? []).map(norm);
  const matchedSkills = required.filter((s) => skills.includes(norm(s)));
  const missingSkills = required.filter((s) => !skills.includes(norm(s)));

  // Skills
  const skillRatio = required.length ? matchedSkills.length / required.length : 0.5;
  let score = skillRatio * weights.skills;
  reasons.push({
    ok: skillRatio >= 0.5,
    text: required.length
      ? `${matchedSkills.length}/${required.length} required skills matched`
      : "No specific skills required",
  });

  // Interests / career relevance
  const interests = profile?.interests ?? [];
  const haystack = norm(
    [
      opportunity.title,
      opportunity.category,
      opportunity.description ?? "",
      ...(opportunity.tags ?? []),
      ...required,
    ].join(" "),
  );
  const matchedInterests = interests.filter((interest) =>
    (INTEREST_KEYWORDS[interest] ?? [norm(interest)]).some((kw) => haystack.includes(kw)),
  );
  const targetRoleHit =
    !!profile?.target_role && haystack.includes(norm(profile.target_role).split(" ")[0] ?? "");
  const interestRatio = interests.length
    ? Math.min(1, matchedInterests.length / Math.min(2, interests.length))
    : 0.4;
  score += Math.max(interestRatio, targetRoleHit ? 0.7 : 0) * weights.interests;
  reasons.push({
    ok: matchedInterests.length > 0 || targetRoleHit,
    text: matchedInterests.length
      ? `Matches your interest in ${matchedInterests.slice(0, 2).join(" & ")}`
      : targetRoleHit
        ? `Relevant to your target role (${profile?.target_role})`
        : "Outside your stated interests",
  });

  // Education / eligibility
  const eduReq = norm(opportunity.education_requirement ?? "");
  const degree = norm(profile?.degree ?? "");
  const eduOk = !eduReq || eduReq.includes("any") || !degree || eduReq.includes(degree.split(" ")[0] ?? "");
  score += (eduOk ? 1 : 0.4) * weights.education;
  reasons.push({
    ok: eduOk,
    text: eduOk ? "You meet the education requirement" : "Education requirement may not match",
  });

  // Experience
  const need = EXPERIENCE_ORDER.indexOf(opportunity.experience_level);
  const have = EXPERIENCE_ORDER.indexOf(profile?.experience_level ?? "Beginner");
  const expScore = have >= need ? 1 : need - have === 1 ? 0.6 : 0.3;
  score += expScore * weights.experience;
  reasons.push({
    ok: have >= need,
    text:
      have >= need
        ? `Suitable for your ${profile?.experience_level ?? "Beginner"} experience level`
        : `Aimed at ${opportunity.experience_level} level — a stretch opportunity`,
  });

  // Work mode
  const modeOk = !profile?.work_mode || profile.work_mode === opportunity.work_mode;
  score += (modeOk ? 1 : 0.3) * weights.workMode;
  reasons.push({
    ok: modeOk,
    text: modeOk
      ? `${opportunity.work_mode} matches your preferred work mode`
      : `${opportunity.work_mode} differs from your ${profile?.work_mode} preference`,
  });

  // Opportunity type preference
  const prefs = profile?.preferred_types ?? [];
  const prefOk = prefs.length === 0 || prefs.some((p) => norm(p) === norm(opportunity.category));
  score += (prefOk ? 1 : 0.3) * weights.preferences;
  reasons.push({
    ok: prefOk,
    text: prefOk
      ? `${opportunity.category} is one of your preferred opportunity types`
      : `${opportunity.category} is outside your selected opportunity types`,
  });

  return {
    score: Math.max(5, Math.min(99, Math.round(score))),
    reasons,
    matchedSkills,
    missingSkills,
  };
}

export function profileCompletion(profile: Record<string, unknown> | null | undefined): number {
  if (!profile) return 0;
  const checks: Array<boolean> = [
    !!profile["full_name"],
    !!profile["city"] || !!profile["country"],
    !!profile["college"],
    !!profile["degree"],
    !!profile["graduation_year"],
    Array.isArray(profile["skills"]) && (profile["skills"] as string[]).length > 0,
    Array.isArray(profile["interests"]) && (profile["interests"] as string[]).length > 0,
    Array.isArray(profile["preferred_types"]) && (profile["preferred_types"] as string[]).length > 0,
    !!profile["target_role"],
    !!profile["work_mode"],
    !!profile["experience_level"],
    !!profile["resume_name"] || !!profile["resume_url"],
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const CATEGORIES = [
  "Internship",
  "Scholarship",
  "Hackathon",
  "Competition",
  "Certification",
  "Workshop",
  "Fellowship",
  "Research",
  "Part-time",
];

export const SKILL_OPTIONS = [
  "Python", "Java", "JavaScript", "React", "Node.js", "MongoDB", "SQL", "AI/ML",
  "Data Science", "Cybersecurity", "Cloud", "UI/UX", "Digital Marketing",
  "Finance", "Communication", "Leadership", "Research", "Business", "Entrepreneurship",
];

export const INTEREST_OPTIONS = [
  "AI", "FinTech", "Web Development", "Data Science", "Cybersecurity", "IoT",
  "Business", "Marketing", "Research", "Design", "Entrepreneurship",
];

export const WORK_MODES = ["Remote", "Hybrid", "On-site"];
export const EXPERIENCE_LEVELS = EXPERIENCE_ORDER;
export const APPLICATION_STATUSES = [
  "Saved",
  "Interested",
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
  "Closed",
];

export const PREMIUM_PRICE_INR = 199;

export function daysUntil(deadline: string | null | undefined): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline + "T23:59:59").getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function deadlineLabel(deadline: string | null | undefined): string {
  const d = daysUntil(deadline);
  if (d === null) return "No deadline";
  if (d < 0) return "Closed";
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  if (d <= 7) return `${d} days left`;
  return new Date(deadline!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
