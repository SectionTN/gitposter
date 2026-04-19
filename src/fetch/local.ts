import simpleGit from 'simple-git'
import { statSync, readdirSync } from 'fs'
import path from 'path'
import type { RawData, RawCommit, RawTag } from '../data/model.js'

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript',
  '.py': 'Python',
  '.rs': 'Rust',
  '.go': 'Go',
  '.java': 'Java',
  '.cpp': 'C++', '.cc': 'C++', '.cxx': 'C++',
  '.c': 'C', '.h': 'C',
  '.rb': 'Ruby',
  '.swift': 'Swift',
  '.kt': 'Kotlin',
  '.css': 'CSS', '.scss': 'CSS', '.sass': 'CSS',
  '.html': 'HTML', '.htm': 'HTML',
  '.sh': 'Shell', '.bash': 'Shell',
}

export async function fetchFromLocal(repoPath: string): Promise<RawData> {
  const git = simpleGit(repoPath)

  const isRepo = await git.checkIsRepo().catch(() => false)
  if (!isRepo) throw new Error(`${repoPath} is not a git repository`)

  const [log, tags] = await Promise.all([
    git.log({ '--all': null }),
    git.tags(),
  ])

  const commits: RawCommit[] = log.all.map(c => ({
    sha: c.hash,
    date: new Date(c.date),
    author: { name: c.author_name, email: c.author_email },
    message: c.message,
  }))

  const shaDateMap = new Map(commits.map(c => [c.sha.slice(0, 7), c.date]))
  const rawTags: RawTag[] = await Promise.all(
    tags.all.map(async name => {
      try {
        const res = await git.raw(['rev-list', '-n', '1', name])
        const sha = res.trim().slice(0, 7)
        return { name, date: shaDateMap.get(sha) ?? null }
      } catch {
        return { name, date: null }
      }
    })
  )

  const languages = scanLanguages(repoPath)

  const contributorMap = new Map<string, { name: string; email: string; commits: number }>()
  commits.forEach(c => {
    const key = c.author.email || c.author.name
    const existing = contributorMap.get(key)
    if (existing) {
      existing.commits++
    } else {
      contributorMap.set(key, { name: c.author.name, email: c.author.email, commits: 1 })
    }
  })

  const remoteUrl = await git.listRemote(['--get-url', 'origin']).catch(() => '')
  const name = path.basename(repoPath)
  const owner = parseOwnerFromRemote(remoteUrl) ?? 'local'

  return {
    owner,
    name,
    description: '',
    commits,
    tags: rawTags,
    languages,
    contributors: Array.from(contributorMap.values()).sort((a, b) => b.commits - a.commits),
  }
}

function scanLanguages(repoPath: string): Record<string, number> {
  const counts: Record<string, number> = {}
  try { walkDir(repoPath, counts, 0) } catch { /* best-effort */ }
  return counts
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage'])

function walkDir(dir: string, counts: Record<string, number>, depth: number): void {
  if (depth > 6) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(full, counts, depth + 1)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      const lang = EXT_TO_LANG[ext]
      if (lang) {
        try { counts[lang] = (counts[lang] ?? 0) + statSync(full).size } catch { /* skip */ }
      }
    }
  }
}

function parseOwnerFromRemote(url: string): string | null {
  const match = url.match(/[:/]([^/]+)\/[^/]+(?:\.git)?$/)
  return match ? match[1] : null
}
