import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchFromGitHub } from '../../src/fetch/github.js'

const mockPaginate = vi.fn()
const mockListLanguages = vi.fn()
const mockGetRepo = vi.fn()

vi.mock('@octokit/rest', () => ({
  Octokit: vi.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listCommits: 'listCommits',
        listTags: 'listTags',
        listContributors: 'listContributors',
        listLanguages: mockListLanguages,
        get: mockGetRepo,
      },
    },
    paginate: mockPaginate,
  })),
}))

beforeEach(() => vi.clearAllMocks())

describe('fetchFromGitHub', () => {
  it('returns RawData with commits, tags, languages, contributors', async () => {
    mockPaginate.mockImplementation(async (fn: string) => {
      if (fn === 'listCommits') {
        return [
          {
            sha: 'abc123',
            commit: {
              author: { name: 'Alice', email: 'a@a.com', date: '2024-03-01T10:00:00Z' },
              message: 'init',
            },
          },
        ]
      }
      if (fn === 'listTags') return [{ name: 'v1.0.0', commit: { sha: 'abc123' } }]
      if (fn === 'listContributors') return [{ login: 'alice', name: 'Alice', email: 'a@a.com', contributions: 1 }]
      return []
    })
    mockListLanguages.mockResolvedValue({ data: { TypeScript: 5000 } })
    mockGetRepo.mockResolvedValue({ data: { description: 'A repo' } })

    const raw = await fetchFromGitHub('alice', 'myrepo', undefined)

    expect(raw.owner).toBe('alice')
    expect(raw.name).toBe('myrepo')
    expect(raw.commits).toHaveLength(1)
    expect(raw.commits[0].author.name).toBe('Alice')
    expect(raw.languages['TypeScript']).toBe(5000)
  })

  it('throws clear error on 404', async () => {
    mockPaginate.mockRejectedValue(Object.assign(new Error('Not Found'), { status: 404 }))

    await expect(fetchFromGitHub('nobody', 'ghost', undefined)).rejects.toThrow(
      'Repository nobody/ghost not found'
    )
  })

  it('throws rate limit error with reset time on 403', async () => {
    const err = Object.assign(new Error('Forbidden'), {
      status: 403,
      response: { headers: { 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600) } },
    })
    mockPaginate.mockRejectedValue(err)

    await expect(fetchFromGitHub('alice', 'myrepo', undefined)).rejects.toThrow(/rate limit/i)
  })
})
