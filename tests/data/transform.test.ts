import { describe, it, expect } from 'vitest'
import {
  cleanMilestoneLabel,
  hashToColorIndex,
  aggregateToDayBuckets,
  buildLanguages,
  buildRepoData,
} from '../../src/data/transform.js'
import type { RawData } from '../../src/data/model.js'
import { dark } from '../../src/render/themes/dark.js'

describe('cleanMilestoneLabel', () => {
  it('leaves semver tags unchanged', () => {
    expect(cleanMilestoneLabel('v1.0.0')).toBe('v1.0.0')
  })

  it('replaces hyphens with spaces in slug tags', () => {
    expect(cleanMilestoneLabel('phase-01-complete')).toBe('phase 01 complete')
  })

  it('handles tags with underscores', () => {
    expect(cleanMilestoneLabel('release_2024')).toBe('release 2024')
  })
})

describe('hashToColorIndex', () => {
  it('returns index within palette bounds', () => {
    const idx = hashToColorIndex('Alice', 8)
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(8)
  })

  it('same name always returns same index', () => {
    expect(hashToColorIndex('Bob', 10)).toBe(hashToColorIndex('Bob', 10))
  })

  it('different names return different indices (usually)', () => {
    const indices = new Set(['Alice', 'Bob', 'Charlie', 'Dave'].map(n => hashToColorIndex(n, 10)))
    expect(indices.size).toBeGreaterThan(1)
  })
})

describe('aggregateToDayBuckets', () => {
  it('groups commits by calendar day', () => {
    const commits = [
      { sha: 'a', date: new Date('2024-01-01T10:00:00Z'), author: { name: 'Alice', email: 'a@a.com' }, message: '' },
      { sha: 'b', date: new Date('2024-01-01T14:00:00Z'), author: { name: 'Bob', email: 'b@b.com' }, message: '' },
      { sha: 'c', date: new Date('2024-01-02T09:00:00Z'), author: { name: 'Alice', email: 'a@a.com' }, message: '' },
    ]
    const buckets = aggregateToDayBuckets(commits)
    expect(buckets).toHaveLength(2)
    expect(buckets[0].count).toBe(2)
    expect(buckets[1].count).toBe(1)
  })

  it('fills gaps between first and last commit with zero-count days', () => {
    const commits = [
      { sha: 'a', date: new Date('2024-01-01'), author: { name: 'A', email: '' }, message: '' },
      { sha: 'b', date: new Date('2024-01-04'), author: { name: 'A', email: '' }, message: '' },
    ]
    const buckets = aggregateToDayBuckets(commits)
    expect(buckets).toHaveLength(4)
    expect(buckets[1].count).toBe(0)
    expect(buckets[2].count).toBe(0)
  })
})

describe('buildLanguages', () => {
  it('converts bytes map to sorted Language array with percentages', () => {
    const langs = buildLanguages({ TypeScript: 7200, JavaScript: 1400, CSS: 800, Other: 600 })
    expect(langs[0].name).toBe('TypeScript')
    expect(langs[0].pct).toBeCloseTo(72, 0)
    expect(langs[0].color).toBe('#3178c6')
  })

  it('collapses languages under 2% into Other', () => {
    const bytes: Record<string, number> = {
      TypeScript: 9000, JavaScript: 800, Makefile: 50, Dockerfile: 40, Shell: 110,
    }
    const langs = buildLanguages(bytes)
    const other = langs.find(l => l.name === 'Other')
    expect(other).toBeDefined()
  })
})

describe('buildRepoData', () => {
  it('produces a valid RepoData from raw data', () => {
    const raw: RawData = {
      owner: 'alice',
      name: 'myrepo',
      description: 'A repo',
      commits: [
        { sha: 'a', date: new Date('2024-03-01'), author: { name: 'Alice', email: 'a@a.com' }, message: 'init' },
        { sha: 'b', date: new Date('2024-03-03'), author: { name: 'Alice', email: 'a@a.com' }, message: 'fix' },
      ],
      tags: [{ name: 'v1.0.0', date: new Date('2024-03-03') }],
      languages: { TypeScript: 5000 },
      contributors: [{ name: 'Alice', email: 'a@a.com', commits: 2 }],
    }
    const data = buildRepoData(raw, dark)
    expect(data.repo.name).toBe('myrepo')
    expect(data.stats.totalCommits).toBe(2)
    expect(data.milestones).toHaveLength(1)
    expect(data.milestones[0].label).toBe('v1.0.0')
    expect(data.contributors[0].color).toBeDefined()
  })
})
