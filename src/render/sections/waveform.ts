import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'
import { formatDateShort, interpolateColor } from '../typography.js'

const PAD = 48
const HEIGHT = 160
const BAR_AREA_H = 80

export function drawWaveform(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number): number {
  const days = data.commits
  const maxCount = data.stats.peakDay.count || 1
  const mileStoneDates = new Set(data.milestones.map(m => m.date.toDateString()))
  const totalWidth = 1200 - PAD * 2
  const barW = Math.max(2, Math.floor(totalWidth / Math.max(days.length, 1)) - 1)
  const baseY = y + 36 + BAR_AREA_H

  ctx.font = '9px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText('COMMIT ACTIVITY', PAD, y + 24)

  days.forEach((day, i) => {
    const x = PAD + i * (barW + 1)
    const isMilestone = mileStoneDates.has(day.date.toDateString())
    const heightPct = day.count > 0 ? Math.max(0.06, day.count / maxCount) : 0.03
    const barH = heightPct * BAR_AREA_H

    ctx.shadowBlur = 0
    if (isMilestone && day.count > 0) {
      ctx.fillStyle = theme.accent
      ctx.shadowColor = theme.accent
      ctx.shadowBlur = 8
    } else if (day.count > 0) {
      ctx.fillStyle = interpolateColor(theme.bg, theme.accent, (day.count / maxCount) * 0.85 + 0.15)
    } else {
      ctx.fillStyle = theme.border
    }

    ctx.fillRect(x, baseY - barH, barW, barH)
  })

  ctx.shadowBlur = 0

  if (days.length > 0) {
    ctx.font = '9px "JetBrains Mono"'
    ctx.fillStyle = theme.textMuted
    ctx.fillText(formatDateShort(days[0].date), PAD, baseY + 16)
  }
  if (days.length > 2) {
    ctx.fillText(formatDateShort(days[Math.floor(days.length / 2)].date), 580, baseY + 16)
    ctx.fillText(formatDateShort(days[days.length - 1].date), 1100, baseY + 16)
  }

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y + HEIGHT)
  ctx.lineTo(1200, y + HEIGHT)
  ctx.stroke()

  return y + HEIGHT
}
