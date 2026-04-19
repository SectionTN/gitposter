import type { RawData } from '../data/model.js'
import { fetchFromGitHub } from './github.js'
import { fetchFromLocal } from './local.js'

export type ResolvedInput =
  | { type: 'github'; owner: string; repo: string }
  | { type: 'local'; path: string }

export function resolveInput(input: string): ResolvedInput {
  if (input.startsWith('./') || input.startsWith('/') || input.startsWith('~') || !input.includes('/')) {
    return { type: 'local', path: input }
  }
  const slashIdx = input.indexOf('/')
  return { type: 'github', owner: input.slice(0, slashIdx), repo: input.slice(slashIdx + 1) }
}

export async function fetchRepo(input: string, token?: string): Promise<RawData> {
  const resolved = resolveInput(input)
  if (resolved.type === 'github') {
    return fetchFromGitHub(resolved.owner, resolved.repo, token)
  }
  return fetchFromLocal(resolved.path)
}
