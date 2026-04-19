import { program } from 'commander'
import { writeFileSync } from 'fs'
import path from 'path'
import { fetchRepo } from './fetch/index.js'
import { buildRepoData } from './data/transform.js'
import { render } from './render/canvas.js'
import { THEMES } from './render/themes/index.js'

program
  .name('gitposter')
  .description('Generate a beautiful printable poster from any git repository')
  .argument('<repo>', 'GitHub owner/repo or local path (./path, /abs/path)')
  .option('--theme <theme>', 'Color theme: dark, light, minimal, colorful', 'dark')
  .option('--format <format>', 'Output format: poster (1200x1800) or square (1200x1200 for social media)', 'poster')
  .option('--output <path>', 'Output PNG file path')
  .option('--token <token>', 'GitHub personal access token (or set GITHUB_TOKEN env var)')
  .action(async (repoArg: string, opts: { theme: string; format: string; output?: string; token?: string }) => {
    const token = opts.token ?? process.env.GITHUB_TOKEN

    const theme = THEMES[opts.theme]
    if (!theme) {
      console.error(`Unknown theme "${opts.theme}". Available: dark, light, minimal, colorful`)
      process.exit(1)
    }

    const format = opts.format as 'poster' | 'square'
    if (format !== 'poster' && format !== 'square') {
      console.error(`Unknown format "${opts.format}". Available: poster, square`)
      process.exit(1)
    }

    console.log(`Fetching ${repoArg}...`)
    let raw
    try {
      raw = await fetchRepo(repoArg, token)
    } catch (err: any) {
      console.error(`Error: ${err.message}`)
      process.exit(1)
    }

    console.log(`Building poster (${raw.commits.length} commits, ${raw.contributors.length} contributors)...`)
    const data = buildRepoData(raw, theme)
    const buf = await render(data, theme, format)

    const outPath = opts.output ?? `${raw.name}-poster.png`
    writeFileSync(outPath, buf)
    console.log(`Poster saved to ${path.resolve(outPath)}`)
  })

program.parse()
