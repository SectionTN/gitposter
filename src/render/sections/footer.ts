import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'
import { formatDate } from '../typography.js'

const CANVAS_H = 1800
const FOOTER_H = 60

export function drawFooter(ctx: SKRSContext2D, data: RepoData, theme: Theme): void {
  const y = CANVAS_H - FOOTER_H

  ctx.fillStyle = theme.surface
  ctx.fillRect(0, y, 1200, FOOTER_H)

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(1200, y)
  ctx.stroke()

  ctx.font = '11px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText('gitposter.dev', 48, y + 36)

  ctx.textAlign = 'right'
  ctx.fillText(`Generated ${formatDate(new Date())}`, 1200 - 48, y + 36)
  ctx.textAlign = 'left'
}
