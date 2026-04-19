import { describe, it, expect, afterAll } from 'vitest'
import { execFileSync } from 'child_process'
import { mkdirSync, writeFileSync, rmSync } from 'fs'
import path from 'path'
import os from 'os'
import { fetchFromLocal } from '../../src/fetch/local.js'

const tmpDir = path.join(os.tmpdir(), `gitposter-test-${Date.now()}`)

mkdirSync(tmpDir, { recursive: true })
execFileSync('git', ['init'], { cwd: tmpDir })
execFileSync('git', ['config', 'user.email', 'test@test.com'], { cwd: tmpDir })
execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: tmpDir })
writeFileSync(path.join(tmpDir, 'index.ts'), 'export const x = 1')
execFileSync('git', ['add', '.'], { cwd: tmpDir })
execFileSync('git', ['commit', '-m', 'init'], { cwd: tmpDir })
execFileSync('git', ['tag', 'v1.0.0'], { cwd: tmpDir })
writeFileSync(path.join(tmpDir, 'utils.ts'), 'export const y = 2')
execFileSync('git', ['add', '.'], { cwd: tmpDir })
execFileSync('git', ['commit', '-m', 'add utils'], { cwd: tmpDir })

afterAll(() => rmSync(tmpDir, { recursive: true, force: true }))

describe('fetchFromLocal', () => {
  it('returns commits from a real git repo', async () => {
    const raw = await fetchFromLocal(tmpDir)
    expect(raw.commits.length).toBeGreaterThanOrEqual(2)
    expect(raw.commits[0].author.name).toBe('Test User')
  })

  it('returns tags', async () => {
    const raw = await fetchFromLocal(tmpDir)
    expect(raw.tags.some(t => t.name === 'v1.0.0')).toBe(true)
  })

  it('detects TypeScript from file extensions', async () => {
    const raw = await fetchFromLocal(tmpDir)
    expect(raw.languages['TypeScript']).toBeGreaterThan(0)
  })

  it('throws on non-git directory', async () => {
    await expect(fetchFromLocal(os.tmpdir())).rejects.toThrow(/not a git repository/i)
  })
})
