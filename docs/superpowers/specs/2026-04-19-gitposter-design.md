# gitposter — Design Spec

**Date:** 2026-04-19  
**Status:** Approved

---

## Overview

CLI tool that generates a beautiful, printable PNG poster from any git repository.

```bash
npx gitposter owner/repo
# → outputs reponame-poster.png
```

Target users: solo devs showing off personal projects AND open-source maintainers with multi-contributor, multi-year histories. The design must handle both gracefully.

---

## Architecture

Three-stage pipeline:

```
Input (CLI args)
  → Fetcher (GitHub API | local git)
  → RepoData (normalized data model)
  → Renderer (@napi-rs/canvas)
  → PNG file
```

### File Structure

```
src/
  index.ts              # CLI entry (commander)
  fetch/
    github.ts           # Octokit wrapper — commits, tags, languages, contributors
    local.ts            # simple-git wrapper
    index.ts            # selects github vs local, returns RepoData
  data/
    model.ts            # RepoData and all sub-types
    transform.ts        # raw API/git response → RepoData
  render/
    canvas.ts           # orchestrates sections top-to-bottom
    sections/
      header.ts
      waveform.ts
      milestones.ts
      stats.ts
      languages.ts
      streams.ts        # contributor color bands
      contributorList.ts
      footer.ts
    themes/
      dark.ts
      light.ts
      minimal.ts
      colorful.ts
    typography.ts       # font loading + text helpers
assets/
  fonts/
    Inter-Regular.ttf
    Inter-SemiBold.ttf
    JetBrainsMono-Regular.ttf
```

---

## Data Model

```ts
interface RepoData {
  repo: { owner: string; name: string; description: string }
  dateRange: { first: Date; last: Date; totalDays: number }
  commits: DayBucket[]
  contributors: Contributor[]  // sorted by commit count desc
  milestones: Milestone[]      // from git tags, chronological
  languages: Language[]        // sorted by pct desc
  stats: {
    totalCommits: number
    peakDay: { date: Date; count: number }
    totalTags: number
  }
}

interface DayBucket    { date: Date; count: number; authors: string[] }
interface Contributor  { name: string; email: string; commits: number; color: string }
interface Milestone    { tag: string; date: Date; label: string }
interface Language     { name: string; pct: number; color: string }
```

Contributor colors assigned deterministically from name hash → theme's `contributorPalette`.  
Language colors from a fixed map (TypeScript=#3178c6, Python=#3572A5, Rust=#dea584, Go=#00ADD8, etc.) — consistent across themes.  
Milestone label = cleaned tag name (`v1.0.0` → `v1.0.0`, `phase-01-complete` → `phase 01 complete`).

---

## Renderer

Canvas size: **1200×1800px** (2:3 ratio — print-ready at 300dpi = 4×6in poster).

Sections draw top-to-bottom, each returning the Y offset where it ended:

```ts
async function render(data: RepoData, theme: Theme): Promise<Buffer> {
  const canvas = createCanvas(1200, 1800)
  const ctx = canvas.getContext('2d')
  let y = 0
  y = drawHeader(ctx, data, theme, y)
  y = drawWaveform(ctx, data, theme, y)
  y = drawMilestones(ctx, data, theme, y)
  y = drawStats(ctx, data, theme, y)
  y = drawLanguages(ctx, data, theme, y)
  y = drawStreams(ctx, data, theme, y)
  y = drawContributorList(ctx, data, theme, y)
  drawFooter(ctx, data, theme)   // pinned to bottom
  return canvas.toBuffer('image/png')
}
```

### Sections

**Header** — repo eyebrow (`github / owner`), large repo name, subtitle line (date range · commit count · days active).

**Waveform** — one bar per calendar day. Bar height = `(dayCount / peakCount) * maxBarHeight`. Color intensity scales with commit count. Days with a milestone tag get full-brightness accent color + subtle glow. Date labels at start/mid/end below bars.

**Milestones** — vertical list: colored dot + tag label + date. Cap at 8 milestones; if more, show first 3 and last 3 with an ellipsis row between.

**Stats row** — 4 equal columns: total commits, total days, total tags, peak day count.

**Languages** — thin horizontal bar (widths = pct), then list: color dot + name + pct.

**Contributor streams** — horizontal bands stacked top-to-bottom. Each contributor's band height = `(commits / totalCommits) * streamSectionHeight`. Full canvas width. 1px separator between bands. Renders contributor color from `contributor.color`. Cap at 10 contributors; remainder collapsed into an "Others" band.

**Contributor list** — legend below streams: colored avatar circle (initials) + name + commit count. Two-column layout if >4 contributors.

**Footer** — `gitposter.dev` left, `Generated MMM DD, YYYY` right, pinned 20px from canvas bottom.

### Themes

```ts
interface Theme {
  bg: string
  surface: string
  border: string
  text: string
  textMuted: string
  accent: string
  contributorPalette: string[]  // 8–10 colors
}
```

| Theme     | bg        | accent   | feel                          |
|-----------|-----------|----------|-------------------------------|
| dark      | `#0a120d` | `#52b788`| forest green on near-black    |
| light     | `#f5f0e8` | `#2d6a4f`| cream bg, dark green accents  |
| minimal   | `#ffffff` | `#000000`| pure monochrome               |
| colorful  | `#0f0f1a` | `#a78bfa`| deep navy, vibrant multicolor |

### Typography

Fonts embedded in the npm package under `assets/fonts/`, loaded via `registerFont` at startup.  
- Body / numbers: Inter Regular + SemiBold  
- Labels / monospace sections: JetBrains Mono Regular

---

## CLI

```bash
npx gitposter <owner/repo | ./path> [options]

--theme   dark|light|minimal|colorful   (default: dark)
--output  <path.png>                    (default: <reponame>-poster.png)
--width   <px>                          (default: 1200, height scales 2:3)
--token   <github_token>                (or GITHUB_TOKEN env var)
```

### Data Sources

**GitHub API** (`owner/repo` input): Octokit REST calls — list commits (paginated), list tags, get languages, list contributors. ~3–5 API calls per repo.

**Local git** (`./path` input): `simple-git` — `log`, `tags`, file extension scan for language detection.

**Selection logic:** if input starts with `./`, `/`, or `~` → local path. Otherwise treat as `owner/repo` → GitHub API.

### Rate Limits

Unauthenticated GitHub API = 60 req/hr. Warn if >50 req used; prompt to set `GITHUB_TOKEN`. Large repos (>5000 commits) require pagination — show progress indicator.

### Error Handling

| Condition | Behavior |
|-----------|----------|
| Repo not found (404) | Print clear message, exit 1 |
| Rate limited (403/429) | Show reset time, suggest `--token` |
| Local path not a git repo | Print clear message, exit 1 |
| Tag with no date | Skip milestone silently |
| Repo has no tags | Milestones section hidden |
| Single contributor | Streams section shows one full-width band |

---

## Package

```json
{
  "bin": { "gitposter": "dist/index.js" },
  "files": ["dist/", "assets/fonts/"],
  "engines": { "node": ">=18" }
}
```

Key deps: `@napi-rs/canvas`, `simple-git`, `octokit`, `commander`.  
Fonts (Inter + JetBrains Mono) ship inside the package — no runtime font download.

---

## Stack

- **Runtime:** Node.js ≥18, TypeScript
- **Rendering:** `@napi-rs/canvas`
- **Git:** `simple-git`
- **GitHub:** `octokit`
- **CLI:** `commander`
- **Build:** `tsup` (ESM + CJS dual output)
