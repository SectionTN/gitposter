import { createCanvas } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../data/model.js'
import { ensureFonts } from './typography.js'
import { drawHeader } from './sections/header.js'
import { drawWaveform } from './sections/waveform.js'
import { drawMilestones } from './sections/milestones.js'
import { drawStats } from './sections/stats.js'
import { drawLanguages } from './sections/languages.js'
import { drawContributorList } from './sections/contributorList.js'
import { drawFooter } from './sections/footer.js'

export async function render(data: RepoData, theme: Theme, format: 'poster' | 'square' = 'poster'): Promise<Buffer> {
  ensureFonts()

  const W = format === 'square' ? 1000 : 1200
  const H = format === 'square' ? 1000 : 1800
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, W, H)

  let y = 0
  y = drawHeader(ctx, data, theme, y, W)
  y = drawWaveform(ctx, data, theme, y, W)
  if (format === 'poster') y = drawMilestones(ctx, data, theme, y, W)
  y = drawStats(ctx, data, theme, y, W)
  y = drawLanguages(ctx, data, theme, y, W)
  y = drawContributorList(ctx, data, theme, y, W)
  drawFooter(ctx, data, theme, H, W)

  return canvas.encode('png')
}
