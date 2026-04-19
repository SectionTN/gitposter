import { describe, it, expect, beforeAll } from 'vitest'
import { createCanvas } from '@napi-rs/canvas'
import type { SKRSContext2D } from '@napi-rs/canvas'
import { ensureFonts } from '../../src/render/typography.js'
import { drawHeader } from '../../src/render/sections/header.js'
import { drawWaveform } from '../../src/render/sections/waveform.js'
import { drawMilestones } from '../../src/render/sections/milestones.js'
import { drawStats } from '../../src/render/sections/stats.js'
import { drawLanguages } from '../../src/render/sections/languages.js'
import { drawStreams } from '../../src/render/sections/streams.js'
import { drawContributorList } from '../../src/render/sections/contributorList.js'
import { drawFooter } from '../../src/render/sections/footer.js'
import { dark } from '../../src/render/themes/dark.js'
import type { RepoData } from '../../src/data/model.js'

export const SAMPLE: RepoData = {
  repo: { owner: 'alice', name: 'myrepo', description: 'test' },
  dateRange: { first: new Date('2024-01-01'), last: new Date('2024-01-22'), totalDays: 22 },
  commits: Array.from({ length: 22 }, (_, i) => ({
    date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    count: i % 3 === 0 ? 5 : i % 2 === 0 ? 2 : 0,
    authors: ['Alice'],
  })),
  contributors: [{ name: 'Alice', email: 'a@a.com', commits: 15, color: '#52b788' }],
  milestones: [{ tag: 'v1.0.0', date: new Date('2024-01-10'), label: 'v1.0.0' }],
  languages: [{ name: 'TypeScript', pct: 100, color: '#3178c6' }],
  stats: { totalCommits: 20, peakDay: { date: new Date('2024-01-01'), count: 5 }, totalTags: 1 },
}

export function makeCtx(): SKRSContext2D {
  return createCanvas(1200, 1800).getContext('2d')
}

beforeAll(() => ensureFonts())

describe('drawHeader', () => {
  it('returns Y greater than input Y', () => {
    const ctx = makeCtx()
    expect(drawHeader(ctx, SAMPLE, dark, 0)).toBeGreaterThan(0)
  })

  it('can draw at non-zero starting Y', () => {
    const ctx = makeCtx()
    expect(drawHeader(ctx, SAMPLE, dark, 100)).toBeGreaterThan(100)
  })
})

describe('drawWaveform', () => {
  it('returns Y greater than input Y', () => {
    const ctx = makeCtx()
    expect(drawWaveform(ctx, SAMPLE, dark, 180)).toBeGreaterThan(180)
  })
})

describe('drawMilestones', () => {
  it('returns Y greater than input Y when milestones exist', () => {
    const ctx = makeCtx()
    expect(drawMilestones(ctx, SAMPLE, dark, 340)).toBeGreaterThan(340)
  })

  it('returns same Y when no milestones', () => {
    const ctx = makeCtx()
    expect(drawMilestones(ctx, { ...SAMPLE, milestones: [] }, dark, 340)).toBe(340)
  })
})

describe('drawStats', () => {
  it('returns Y greater than input Y', () => {
    const ctx = makeCtx()
    expect(drawStats(ctx, SAMPLE, dark, 560)).toBeGreaterThan(560)
  })
})

describe('drawLanguages', () => {
  it('returns Y greater than input Y', () => {
    const ctx = makeCtx()
    expect(drawLanguages(ctx, SAMPLE, dark, 680)).toBeGreaterThan(680)
  })
})

describe('drawStreams', () => {
  it('returns Y greater than input Y', () => {
    const ctx = makeCtx()
    expect(drawStreams(ctx, SAMPLE, dark, 820)).toBeGreaterThan(820)
  })

  it('handles single contributor without crashing', () => {
    const ctx = makeCtx()
    expect(() => drawStreams(ctx, { ...SAMPLE, contributors: [SAMPLE.contributors[0]] }, dark, 820)).not.toThrow()
  })
})

describe('drawContributorList', () => {
  it('returns Y greater than input Y', () => {
    const ctx = makeCtx()
    expect(drawContributorList(ctx, SAMPLE, dark, 1020)).toBeGreaterThan(1020)
  })
})

describe('drawFooter', () => {
  it('does not throw', () => {
    const ctx = makeCtx()
    expect(() => drawFooter(ctx, SAMPLE, dark)).not.toThrow()
  })
})
