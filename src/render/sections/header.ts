import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'

const PAD = 48
const HEIGHT = 180

export function drawHeader(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number, W: number): number {
  ctx.fillStyle = theme.surface
  ctx.fillRect(0, y, W, HEIGHT)

  ctx.font = '11px "JetBrains Mono"'
  ctx.fillStyle = theme.accent
  ctx.fillText(`github.com/${data.repo.owner}/${data.repo.name}`, PAD, y + 40)

  ctx.font = '600 60px Inter'
  ctx.fillStyle = theme.text
  ctx.fillText(data.repo.name, PAD, y + 110)

  const firstYear = data.dateRange.first.getFullYear()
  const lastYear = data.dateRange.last.getFullYear()
  const dateStr = firstYear === lastYear ? String(firstYear) : `${firstYear} \u2192 ${lastYear}`
  const authorCount = data.contributors.length
  const authorStr = authorCount === 1 ? '1 author' : `${authorCount} authors`
  const sub = `${dateStr}  \u00b7  ${data.stats.totalCommits} commits  \u00b7  ${authorStr}`
  ctx.font = '11px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText(sub, PAD, y + 140)

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y + HEIGHT)
  ctx.lineTo(W, y + HEIGHT)
  ctx.stroke()

  return y + HEIGHT
}
