import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'

const HEIGHT = 120

export function drawStats(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number): number {
  const cols = [
    { value: String(data.stats.totalCommits), label: 'COMMITS' },
    { value: String(data.dateRange.totalDays), label: 'DAYS' },
    { value: String(data.stats.totalTags), label: 'TAGS' },
    { value: String(data.stats.peakDay.count), label: 'PEAK DAY' },
  ]
  const colW = 1200 / cols.length

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(1200, y)
  ctx.stroke()

  cols.forEach((col, i) => {
    const x = i * colW

    ctx.font = '600 40px Inter'
    ctx.fillStyle = theme.text
    ctx.textAlign = 'center'
    ctx.fillText(col.value, x + colW / 2, y + 68)

    ctx.font = '9px "JetBrains Mono"'
    ctx.fillStyle = theme.accent
    ctx.fillText(col.label, x + colW / 2, y + 90)

    if (i < cols.length - 1) {
      ctx.strokeStyle = theme.border
      ctx.beginPath()
      ctx.moveTo(x + colW, y)
      ctx.lineTo(x + colW, y + HEIGHT)
      ctx.stroke()
    }
  })

  ctx.textAlign = 'left'
  ctx.strokeStyle = theme.border
  ctx.beginPath()
  ctx.moveTo(0, y + HEIGHT)
  ctx.lineTo(1200, y + HEIGHT)
  ctx.stroke()

  return y + HEIGHT
}
