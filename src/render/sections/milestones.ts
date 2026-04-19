import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme, Milestone } from '../../data/model.js'
import { formatDateShort } from '../typography.js'

const PAD = 48
const ROW_H = 44
const HEADER_H = 32

export function drawMilestones(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number, W: number): number {
  if (data.milestones.length === 0) return y

  const all = data.milestones
  const display: (Milestone | null)[] = all.length <= 8
    ? all
    : [...all.slice(0, 3), null, ...all.slice(-3)]

  const HEIGHT = HEADER_H + display.length * ROW_H + 24

  ctx.font = '9px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText('MILESTONES', PAD, y + 24)

  const dotColors = [theme.accent, ...theme.contributorPalette]

  display.forEach((m, i) => {
    const rowY = y + HEADER_H + i * ROW_H

    if (m === null) {
      ctx.font = '11px "JetBrains Mono"'
      ctx.fillStyle = theme.textMuted
      ctx.fillText('···', PAD + 20, rowY + 16)
      return
    }

    ctx.fillStyle = dotColors[i % dotColors.length]
    ctx.beginPath()
    ctx.arc(PAD + 4, rowY + 12, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '14px Inter'
    ctx.fillStyle = theme.text
    ctx.fillText(m.label, PAD + 20, rowY + 17)

    ctx.font = '10px "JetBrains Mono"'
    ctx.fillStyle = theme.textMuted
    ctx.fillText(formatDateShort(m.date), PAD + 20, rowY + 32)
  })

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y + HEIGHT)
  ctx.lineTo(W, y + HEIGHT)
  ctx.stroke()

  return y + HEIGHT
}
