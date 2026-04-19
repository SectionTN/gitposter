import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'

const SECTION_H = 200
const HEADER_H = 32

export function drawStreams(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number): number {
  const contribs = data.contributors.slice(0, 10)
  if (contribs.length === 0) return y

  const total = contribs.reduce((s, c) => s + c.commits, 0)
  const streamH = SECTION_H - HEADER_H

  ctx.font = '9px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText('CONTRIBUTORS', 48, y + 24)

  let bandY = y + HEADER_H
  contribs.forEach((contrib, i) => {
    const bandH = Math.max(4, (contrib.commits / total) * streamH)

    ctx.fillStyle = contrib.color
    ctx.globalAlpha = 0.85
    ctx.fillRect(0, bandY, 1200, bandH)
    ctx.globalAlpha = 1

    if (i < contribs.length - 1) {
      ctx.fillStyle = theme.bg
      ctx.fillRect(0, bandY + bandH, 1200, 1)
    }

    bandY += bandH
  })

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y + SECTION_H)
  ctx.lineTo(1200, y + SECTION_H)
  ctx.stroke()

  return y + SECTION_H
}
