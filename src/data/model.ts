export interface RepoData {
  repo: { owner: string; name: string; description: string }
  dateRange: { first: Date; last: Date; totalDays: number }
  commits: DayBucket[]
  contributors: Contributor[]
  milestones: Milestone[]
  languages: Language[]
  stats: {
    totalCommits: number
    peakDay: { date: Date; count: number }
    totalTags: number
  }
}

export interface DayBucket {
  date: Date
  count: number
  authors: string[]
}

export interface Contributor {
  name: string
  email: string
  commits: number
  color: string
}

export interface Milestone {
  tag: string
  date: Date
  label: string
}

export interface Language {
  name: string
  pct: number
  color: string
}

export interface Theme {
  bg: string
  surface: string
  border: string
  text: string
  textMuted: string
  accent: string
  contributorPalette: string[]
}

export interface RawCommit {
  sha: string
  date: Date
  author: { name: string; email: string }
  message: string
}

export interface RawTag {
  name: string
  date: Date | null
}

export interface RawLanguages {
  [language: string]: number
}

export interface RawContributor {
  name: string
  email: string
  commits: number
}

export interface RawData {
  owner: string
  name: string
  description: string
  commits: RawCommit[]
  tags: RawTag[]
  languages: RawLanguages
  contributors: RawContributor[]
}
