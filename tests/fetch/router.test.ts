import { describe, it, expect } from 'vitest'
import { resolveInput } from '../../src/fetch/index.js'

describe('resolveInput', () => {
  it('treats owner/repo format as GitHub', () => {
    expect(resolveInput('torvalds/linux')).toEqual({ type: 'github', owner: 'torvalds', repo: 'linux' })
  })

  it('treats ./path as local', () => {
    expect(resolveInput('./my-project')).toEqual({ type: 'local', path: './my-project' })
  })

  it('treats /absolute/path as local', () => {
    expect(resolveInput('/home/user/myrepo')).toEqual({ type: 'local', path: '/home/user/myrepo' })
  })

  it('treats ~/path as local', () => {
    expect(resolveInput('~/projects/myrepo')).toEqual({ type: 'local', path: '~/projects/myrepo' })
  })

  it('treats plain name with no slash as local', () => {
    expect(resolveInput('myrepo')).toEqual({ type: 'local', path: 'myrepo' })
  })
})
