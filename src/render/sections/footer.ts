import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'

const PAD = 48
const FOOTER_H = 60

export function drawFooter(ctx: SKRSContext2D, data: RepoData, theme: Theme, canvasH: number, W: number): void {
  const y = canvasH - FOOTER_H

  ctx.fillStyle = theme.surface
  ctx.fillRect(0, y, W, FOOTER_H)

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(W, y)
  ctx.stroke()

  ctx.font = '14px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText('@sectiontn/gitposter', PAD, y + 38)
}
