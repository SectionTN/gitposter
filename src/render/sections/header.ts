import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'
import { formatDateShort } from '../typography.js'

const PAD = 48
const HEIGHT = 180

export function drawHeader(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number): number {
  ctx.fillStyle = theme.surface
  ctx.fillRect(0, y, 1200, HEIGHT)

  ctx.font = '11px "JetBrains Mono"'
  ctx.fillStyle = theme.accent
  ctx.fillText(`⬡ github / ${data.repo.owner}`, PAD, y + 40)

  ctx.font = '600 60px Inter'
  ctx.fillStyle = theme.text
  ctx.fillText(data.repo.name, PAD, y + 110)

  const sub = `${formatDateShort(data.dateRange.first)} — ${formatDateShort(data.dateRange.last)}  ·  ${data.stats.totalCommits} commits  ·  ${data.dateRange.totalDays} days`
  ctx.font = '11px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText(sub, PAD, y + 140)

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y + HEIGHT)
  ctx.lineTo(1200, y + HEIGHT)
  ctx.stroke()

  return y + HEIGHT
}
