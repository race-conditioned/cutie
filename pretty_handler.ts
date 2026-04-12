import type { Handler, Level, LogRecord } from "./handler.ts";
import { c } from "./_colors.ts";

const LEVEL_WIDTH = 5;

function levelColor(level: Level): string {
  switch (level) {
    case "debug": return c.dim;
    case "info":  return c.cyan;
    case "warn":  return c.yellow;
    case "error": return c.red;
  }
}

function formatAttr(key: string, value: unknown): string {
  const str = String(value);
  const quoted = str.includes(" ") ? `"${str}"` : str;
  return `${c.dim}${key}=${quoted}${c.reset}`;
}

/**
 * PrettyHandler writes colored, columnar log lines to the terminal.
 * Suitable for local development.
 *
 * Output format:
 *   INFO   server started    port=8080  stage=local
 *   ERROR  db failed         err="connection refused"
 *
 * Routing:
 *   debug/info → stdout
 *   warn/error → stderr
 */
export class PrettyHandler implements Handler {
  Handle(record: LogRecord): void {
    const label = record.level.toUpperCase().padEnd(LEVEL_WIDTH);
    const coloredLevel = `${levelColor(record.level)}${label}${c.reset}`;
    const coloredMsg = `${c.white}${record.msg}${c.reset}`;

    const attrParts = Object.entries(record.attrs).map(([k, v]) => formatAttr(k, v));
    const attrStr = attrParts.length > 0 ? `  ${attrParts.join("  ")}` : "";

    const line = `  ${coloredLevel}  ${coloredMsg}${attrStr}`;

    const out = record.level === "warn" || record.level === "error"
      ? console.error
      : console.log;
    out(line);
  }
}
