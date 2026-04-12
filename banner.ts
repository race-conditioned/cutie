import { c } from "./_colors.ts";

const MIN_VALUE_WIDTH = 26;

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

/** Normalize pick into an array of groups of [key, value] pairs. */
function toGroups(
  config: Record<string, unknown>,
  pick?: string[] | string[][],
): [string, unknown][][] {
  if (!pick) return [Object.entries(config)];
  if (pick.length === 0) return [[]];
  if (Array.isArray(pick[0])) {
    return (pick as string[][]).map((keys) =>
      keys.map((k) => [k, config[k]] as [string, unknown])
    );
  }
  return [(pick as string[]).map((k) => [k, config[k]] as [string, unknown])];
}

/**
 * Compute layout dimensions from the actual content so nothing overflows.
 * keyCol  = longest key + 2 spaces of breathing room
 * innerWidth = 2 (indent) + keyCol + MIN_VALUE_WIDTH, floored at title + 4
 */
function computeDimensions(
  groups: [string, unknown][][],
  title: string,
): { keyCol: number; innerWidth: number } {
  const allEntries = groups.flat();
  const maxKeyLen = allEntries.length > 0
    ? Math.max(...allEntries.map(([k]) => k.length))
    : 16;
  const keyCol = maxKeyLen + 2;
  const innerWidth = Math.max(2 + keyCol + MIN_VALUE_WIDTH, title.length + 4);
  return { keyCol, innerWidth };
}

function row(
  key: string,
  value: unknown,
  keyCol: number,
  innerWidth: number,
): string {
  const valueWidth = innerWidth - 2 - keyCol;
  const keyPad = " ".repeat(Math.max(0, keyCol - key.length));

  let display = String(value);
  if (display.length > valueWidth) {
    display = display.slice(0, valueWidth - 1) + "…";
  }
  const rightPad = " ".repeat(Math.max(0, valueWidth - display.length));

  return (
    `${c.cyan}│${c.reset}  ${c.blue}${key}${c.reset}${keyPad}` +
    `${c.white}${display}${c.reset}${rightPad}${c.cyan}│${c.reset}`
  );
}

/**
 * PrintBanner renders a styled startup box to stdout.
 *
 * @param title   Displayed centered in the header row
 * @param config  Any object — values stringified with String()
 * @param pick    Flat key list (no dividers) or grouped key lists (dividers between groups)
 *
 * Usage:
 *   // flat — no dividers
 *   PrintBanner("my-app", cfg, ["port", "stage"])
 *
 *   // grouped — ├────┤ divider between each section
 *   PrintBanner("my-app", cfg, [
 *     ["port", "stage", "storeBackend"],
 *     ["listLimitDefault", "listLimitMax"],
 *   ])
 *
 *   // all keys, no dividers
 *   PrintBanner("my-app", cfg)
 */
export function PrintBanner(
  title: string,
  config: Record<string, unknown>,
  pick?: string[] | string[][],
): void {
  const groups = toGroups(config, pick);
  const { keyCol, innerWidth } = computeDimensions(groups, title);
  const line = "─".repeat(innerWidth);
  const divider = `${c.cyan}├${line}┤${c.reset}`;

  const titlePad = Math.floor((innerWidth - title.length) / 2);
  const titleRow =
    `${c.cyan}│${c.reset}${" ".repeat(titlePad)}${c.bold}${c.white}${title}${c.reset}` +
    `${" ".repeat(innerWidth - titlePad - title.length)}${c.cyan}│${c.reset}`;

  console.log();
  console.log(`${c.cyan}╭${line}╮${c.reset}`);
  console.log(titleRow);
  console.log(divider);
  for (let i = 0; i < groups.length; i++) {
    for (const [key, value] of groups[i]) {
      console.log(row(key, value, keyCol, innerWidth));
    }
    if (i < groups.length - 1) {
      console.log(divider);
    }
  }
  console.log(`${c.cyan}╰${line}╯${c.reset}`);
  console.log();
}

/**
 * PrintListening writes a styled "server is up" line to stdout.
 * Intended for local/dev use only.
 *
 *   ▶  http://localhost:8080  ·  11 handlers
 */
export function PrintListening(addr: string, handlers?: number): void {
  const suffix = handlers !== undefined
    ? `  ${c.dim}·  ${handlers} handlers${c.reset}`
    : "";
  console.log(`  ${c.cyan}▶${c.reset}  ${c.bold}${c.white}${addr}${c.reset}${suffix}\n`);
}
