import type { SKRSContext2D } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../../data/model.js'

const PAD = 48
const HEIGHT = 140

export function drawLanguages(ctx: SKRSContext2D, data: RepoData, theme: Theme, y: number, W: number): number {
  if (data.languages.length === 0) return y

  const INNER_W = W - PAD * 2

  ctx.font = '9px "JetBrains Mono"'
  ctx.fillStyle = theme.textMuted
  ctx.fillText('LANGUAGES', PAD, y + 24)

  let x = PAD
  data.languages.forEach(lang => {
    const w = (lang.pct / 100) * INNER_W
    ctx.fillStyle = lang.color
    ctx.fillRect(x, y + 36, w - 2, 6)
    x += w
  })

  data.languages.slice(0, 6).forEach((lang, i) => {
    const rowY = y + 56 + i * 20

    ctx.fillStyle = lang.color
    ctx.beginPath()
    ctx.arc(PAD + 4, rowY + 4, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '11px "JetBrains Mono"'
    ctx.fillStyle = theme.text
    ctx.fillText(lang.name, PAD + 16, rowY + 8)

    ctx.fillStyle = theme.textMuted
    ctx.textAlign = 'right'
    ctx.fillText(`${lang.pct}%`, W - PAD, rowY + 8)
    ctx.textAlign = 'left'
  })

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, y + HEIGHT)
  ctx.lineTo(W, y + HEIGHT)
  ctx.stroke()

  return y + HEIGHT
}
