import { Octokit } from '@octokit/rest'
import type { RawData, RawCommit, RawTag } from '../data/model.js'

export async function fetchFromGitHub(
  owner: string,
  name: string,
  token: string | undefined
): Promise<RawData> {
  const octokit = new Octokit({ auth: token })

  try {
    const [rawCommits, rawTags, langRes, contribs, repoRes] = await Promise.all([
      octokit.paginate(octokit.rest.repos.listCommits, { owner, repo: name, per_page: 100 }),
      octokit.paginate(octokit.rest.repos.listTags, { owner, repo: name, per_page: 100 }),
      octokit.rest.repos.listLanguages({ owner, repo: name }),
      octokit.paginate(octokit.rest.repos.listContributors, { owner, repo: name, per_page: 100 }).catch(() => []),
      octokit.rest.repos.get({ owner, repo: name }),
    ])

    const commits: RawCommit[] = (rawCommits as any[]).map(c => ({
      sha: c.sha,
      date: new Date(c.commit.author?.date ?? c.commit.committer?.date ?? Date.now()),
      author: {
        name: c.commit.author?.name ?? c.author?.login ?? 'Unknown',
        email: c.commit.author?.email ?? '',
      },
      message: c.commit.message,
    }))

    const shaMap = new Map(commits.map(c => [c.sha.slice(0, 7), c.date]))
    const tags: RawTag[] = (rawTags as any[]).map(t => ({
      name: t.name,
      date: shaMap.get((t.commit?.sha ?? '').slice(0, 7)) ?? null,
    }))

    return {
      owner,
      name,
      description: (repoRes as any).data?.description ?? '',
      commits,
      tags,
      languages: (langRes as any).data as Record<string, number>,
      contributors: (contribs as any[]).map(c => ({
        name: c.name ?? c.login ?? 'Unknown',
        email: c.email ?? '',
        commits: c.contributions ?? 0,
      })),
    }
  } catch (err: any) {
    if (err?.status === 404) throw new Error(`Repository ${owner}/${name} not found`)
    if (err?.status === 403 || err?.status === 429) {
      const reset = err?.response?.headers?.['x-ratelimit-reset']
      const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'unknown'
      throw new Error(
        `GitHub rate limit exceeded. Resets at ${resetTime}. Set --token or GITHUB_TOKEN to increase limits.`
      )
    }
    throw err
  }
}
