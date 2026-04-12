/**
 * Shared ANSI color palette.
 * Internal — not exported from mod.ts.
 * Used by PrettyHandler and PrintBanner to keep the visual style cohesive.
 */
export const c = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  cyan:    "\x1b[36m",
  yellow:  "\x1b[33m",
  red:     "\x1b[31m",
  white:   "\x1b[97m",
  blue:    "\x1b[34m",
  magenta: "\x1b[35m",
};
