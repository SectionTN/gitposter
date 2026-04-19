import { createCanvas } from '@napi-rs/canvas'
import type { RepoData, Theme } from '../data/model.js'
import { ensureFonts } from './typography.js'
import { drawHeader } from './sections/header.js'
import { drawWaveform } from './sections/waveform.js'
import { drawMilestones } from './sections/milestones.js'
import { drawStats } from './sections/stats.js'
import { drawLanguages } from './sections/languages.js'
import { drawStreams } from './sections/streams.js'
import { drawContributorList } from './sections/contributorList.js'
import { drawFooter } from './sections/footer.js'

export async function render(data: RepoData, theme: Theme): Promise<Buffer> {
  ensureFonts()

  const canvas = createCanvas(1200, 1800)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, 1200, 1800)

  let y = 0
  y = drawHeader(ctx, data, theme, y)
  y = drawWaveform(ctx, data, theme, y)
  y = drawMilestones(ctx, data, theme, y)
  y = drawStats(ctx, data, theme, y)
  y = drawLanguages(ctx, data, theme, y)
  y = drawStreams(ctx, data, theme, y)
  y = drawContributorList(ctx, data, theme, y)
  drawFooter(ctx, data, theme)

  return canvas.encode('png')
}
