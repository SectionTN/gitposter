import { GlobalFonts } from '@napi-rs/canvas'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let fontsRegistered = false

export function ensureFonts(): void {
  if (fontsRegistered) return
  const fontsDir = path.resolve(__dirname, '../../assets/fonts')
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Inter-Regular.ttf'), 'Inter')
  GlobalFonts.registerFromPath(path.join(fontsDir, 'Inter-SemiBold.ttf'), 'Inter SemiBold')
  GlobalFonts.registerFromPath(path.join(fontsDir, 'JetBrainsMono-Regular.ttf'), 'JetBrains Mono')
  fontsRegistered = true
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function interpolateColor(from: string, to: string, t: number): string {
  const f = hexToRgb(from)
  const toC = hexToRgb(to)
  const r = Math.round(f.r + (toC.r - f.r) * t)
  const g = Math.round(f.g + (toC.g - f.g) * t)
  const b = Math.round(f.b + (toC.b - f.b) * t)
  return `rgb(${r},${g},${b})`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (hex.startsWith('rgb')) {
    const m = hex.match(/\d+/g)!
    return { r: +m[0], g: +m[1], b: +m[2] }
  }
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}
