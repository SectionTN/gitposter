import { describe, it, expect } from 'vitest'
import { render } from '../../src/render/canvas.js'
import { dark, light, minimal, colorful } from '../../src/render/themes/index.js'
import type { RepoData } from '../../src/data/model.js'

const SAMPLE: RepoData = {
  repo: { owner: 'alice', name: 'myrepo', description: 'test' },
  dateRange: { first: new Date('2024-01-01'), last: new Date('2024-01-22'), totalDays: 22 },
  commits: Array.from({ length: 22 }, (_, i) => ({
    date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    count: i % 3 === 0 ? 5 : 0,
    authors: ['Alice'],
  })),
  contributors: [{ name: 'Alice', email: 'a@a.com', commits: 15, color: '#52b788' }],
  milestones: [{ tag: 'v1.0.0', date: new Date('2024-01-10'), label: 'v1.0.0' }],
  languages: [{ name: 'TypeScript', pct: 100, color: '#3178c6' }],
  stats: { totalCommits: 20, peakDay: { date: new Date('2024-01-01'), count: 5 }, totalTags: 1 },
}

describe('render', () => {
  it('returns a non-empty PNG buffer', async () => {
    const buf = await render(SAMPLE, dark)
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(1000)
    expect(buf[0]).toBe(0x89)
    expect(buf[1]).toBe(0x50)
    expect(buf[2]).toBe(0x4e)
    expect(buf[3]).toBe(0x47)
  })

  it('renders all four themes without throwing', async () => {
    for (const theme of [dark, light, minimal, colorful]) {
      await expect(render(SAMPLE, theme)).resolves.toBeInstanceOf(Buffer)
    }
  })
})
