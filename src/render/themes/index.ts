export { colorful } from "./colorful.js";
export { dark } from "./dark.js";
export { light } from "./light.js";
export { minimal } from "./minimal.js";

import type { Theme } from "../../data/model.js";
import { colorful } from "./colorful.js";
import { dark } from "./dark.js";
import { light } from "./light.js";
import { minimal } from "./minimal.js";

export const THEMES: Record<string, Theme> = { dark, light, minimal, colorful };
