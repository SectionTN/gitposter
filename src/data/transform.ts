import type {
  Contributor,
  DayBucket,
  Language,
  Milestone,
  RawCommit,
  RawData,
  RepoData,
  Theme,
} from "./model.js";

export function cleanMilestoneLabel(tag: string): string {
  if (/^v?\d+\.\d+/.test(tag)) return tag;
  return tag.replace(/[-_]/g, " ");
}

export function hashToColorIndex(name: string, paletteLength: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % paletteLength;
}

export function aggregateToDayBuckets(commits: RawCommit[]): DayBucket[] {
  if (commits.length === 0) return [];

  const sorted = [...commits].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  const map = new Map<string, DayBucket>();

  sorted.forEach((c) => {
    const key = toDateKey(c.date);
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.authors.push(c.author.name);
    } else {
      map.set(key, {
        date: startOfDay(c.date),
        count: 1,
        authors: [c.author.name],
      });
    }
  });

  const first = startOfDay(sorted[0].date);
  const last = startOfDay(sorted[sorted.length - 1].date);
  const result: DayBucket[] = [];
  const cursor = new Date(first);

  while (cursor <= last) {
    const key = toDateKey(cursor);
    result.push(
      map.get(key) ?? { date: new Date(cursor), count: 0, authors: [] },
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Other: "#8b9dc3",
};

export function buildLanguages(rawLangs: Record<string, number>): Language[] {
  const total = Object.values(rawLangs).reduce((s, v) => s + v, 0);
  if (total === 0) return [];

  const entries = Object.entries(rawLangs)
    .map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);

  const significant = entries.filter((e) => e.pct >= 2);
  const other = entries.filter((e) => e.pct < 2);
  const otherPct = other.reduce((s, e) => s + e.pct, 0);

  const result = significant.map((e) => ({
    name: e.name,
    pct: Math.round(e.pct),
    color: LANGUAGE_COLORS[e.name] ?? LANGUAGE_COLORS.Other,
  }));

  if (otherPct > 0) {
    result.push({
      name: "Other",
      pct: Math.round(otherPct),
      color: LANGUAGE_COLORS.Other,
    });
  }

  return result;
}

export function buildRepoData(raw: RawData, theme: Theme): RepoData {
  const buckets = aggregateToDayBuckets(raw.commits);
  const peakBucket = buckets.reduce(
    (max, b) => (b.count > max.count ? b : max),
    buckets[0] ?? { date: new Date(), count: 0, authors: [] },
  );

  const contributors: Contributor[] = raw.contributors
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10)
    .map((c) => ({
      login: c.login,
      name: c.name,
      email: c.email,
      commits: c.commits,
      color:
        theme.contributorPalette[
        hashToColorIndex(c.name, theme.contributorPalette.length)
        ],
    }));

  const milestones: Milestone[] = raw.tags
    .filter((t) => t.date !== null)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .map((t) => ({
      tag: t.name,
      date: t.date!,
      label: cleanMilestoneLabel(t.name),
    }));

  const languages = buildLanguages(raw.languages);

  const first = buckets.length > 0 ? buckets[0].date : new Date();
  const last =
    buckets.length > 0 ? buckets[buckets.length - 1].date : new Date();
  const totalDays = Math.max(
    1,
    Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1,
  );

  return {
    repo: { owner: raw.owner, name: raw.name, description: raw.description },
    dateRange: { first, last, totalDays },
    commits: buckets,
    contributors,
    milestones,
    languages,
    stats: {
      totalCommits: raw.commits.length,
      peakDay: { date: peakBucket.date, count: peakBucket.count },
      totalTags: raw.tags.length,
    },
  };
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setUTCHours(0, 0, 0, 0);
  return n;
}
