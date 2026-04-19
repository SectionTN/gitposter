import type { Buffer } from "node:buffer";
import { createCanvas } from "@napi-rs/canvas";
import type { RepoData, Theme } from "../data/model.js";
import { drawContributorList } from "./sections/contributorList.js";
import { drawFooter } from "./sections/footer.js";
import { drawHeader } from "./sections/header.js";
import { drawLanguages } from "./sections/languages.js";
import { drawMilestones } from "./sections/milestones.js";
import { drawStats } from "./sections/stats.js";
import { drawWaveform } from "./sections/waveform.js";
import { ensureFonts } from "./typography.js";

function computeSquareHeight(data: RepoData): number {
  const langShown = Math.min(data.languages.length, 6);
  const langsH = data.languages.length === 0 ? 0 : 56 + langShown * 22 + 20;

  const contribs = Math.min(data.contributors.length, 10);
  const rows = contribs > 4 ? Math.ceil(contribs / 2) : contribs;
  const contribsH = contribs === 0 ? 0 : 36 + rows * 56 + 24;

  // header + waveform + stats + langs + contributors + footer
  return 180 + 160 + 120 + langsH + contribsH + 60;
}

export async function render(
  data: RepoData,
  theme: Theme,
  format: "poster" | "square" = "poster",
): Promise<Buffer> {
  ensureFonts();

  const W = 1200;
  const H = format === "square" ? computeSquareHeight(data) : 1800;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  let y = 0;
  y = drawHeader(ctx, data, theme, y, W);
  y = drawWaveform(ctx, data, theme, y, W);
  if (format === "poster") y = drawMilestones(ctx, data, theme, y, W);
  y = drawStats(ctx, data, theme, y, W);
  y = drawLanguages(ctx, data, theme, y, W);
  y = await drawContributorList(ctx, data, theme, y, W);
  drawFooter(ctx, data, theme, H, W);

  return canvas.encode("png");
}
