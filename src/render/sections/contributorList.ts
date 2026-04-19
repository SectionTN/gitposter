import type { SKRSContext2D } from "@napi-rs/canvas";
import { loadImage } from "@napi-rs/canvas";
import type { Contributor, RepoData, Theme } from "../../data/model.js";

const PAD = 48;
const ROW_H = 56;
const HEADER_H = 36;
const AVATAR_R = 22;

export async function drawContributorList(
	ctx: SKRSContext2D,
	data: RepoData,
	theme: Theme,
	y: number,
	W: number,
): Promise<number> {
	const contribs = data.contributors.slice(0, 10);
	if (contribs.length === 0) return y;

	const twoCols = contribs.length > 4;
	const colW = twoCols ? (W - PAD * 2) / 2 : W - PAD * 2;
	const rows = twoCols ? Math.ceil(contribs.length / 2) : contribs.length;
	const HEIGHT = HEADER_H + rows * ROW_H + 24;

	ctx.font = '13px "JetBrains Mono"';
	ctx.fillStyle = theme.textMuted;
	ctx.fillText("CONTRIBUTORS", PAD, y + 26);

	await Promise.all(
		contribs.map(async (contrib, i) => {
			const col = twoCols ? i % 2 : 0;
			const row = twoCols ? Math.floor(i / 2) : i;
			const cx = PAD + col * colW + AVATAR_R;
			const cy = y + HEADER_H + row * ROW_H + AVATAR_R;

			await drawAvatar(ctx, contrib, cx, cy, AVATAR_R);

			ctx.font = "18px Inter";
			ctx.fillStyle = theme.text;
			ctx.fillText(contrib.name, cx + AVATAR_R + 12, cy + 5);

			ctx.font = '12px "JetBrains Mono"';
			ctx.fillStyle = theme.textMuted;
			ctx.fillText(`${contrib.commits} commits`, cx + AVATAR_R + 12, cy + 22);
		}),
	);

	ctx.strokeStyle = theme.border;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, y + HEIGHT);
	ctx.lineTo(W, y + HEIGHT);
	ctx.stroke();

	return y + HEIGHT;
}

async function drawAvatar(
	ctx: SKRSContext2D,
	contrib: Contributor,
	cx: number,
	cy: number,
	r: number,
): Promise<void> {
	if (contrib.login) {
		try {
			const img = await loadImage(
				`https://avatars.githubusercontent.com/${contrib.login}?s=${r * 2}`,
			);
			ctx.save();
			ctx.beginPath();
			ctx.arc(cx, cy, r, 0, Math.PI * 2);
			ctx.clip();
			ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
			ctx.restore();
			return;
		} catch {
			// fall through to initials
		}
	}

	ctx.fillStyle = contrib.color;
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.fill();

	const initials = contrib.name
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.join("");

	ctx.font = `600 ${Math.round(r * 0.7)}px Inter`;
	ctx.fillStyle = "#0a120d";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(initials, cx, cy);
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
}
