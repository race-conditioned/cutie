import type { Handler, Level, LogRecord } from "./handler.ts";
import { c } from "./_colors.ts";

function levelColor(level: Level): string {
  switch (level) {
    case "debug": return c.dim;
    case "info":  return c.cyan;
    case "warn":  return c.yellow;
    case "error": return c.red;
  }
}

function colorizeValue(value: unknown): string {
  if (typeof value === "string") return `${c.cyan}"${value}"${c.reset}`;
  if (typeof value === "number") return `${c.yellow}${value}${c.reset}`;
  if (typeof value === "boolean") return `${c.yellow}${value}${c.reset}`;
  if (value === null) return `${c.dim}null${c.reset}`;
  return `${c.white}${JSON.stringify(value)}${c.reset}`;
}

function colorizeKeyValue(key: string, value: unknown, level: Level): string {
  const coloredKey = key === "level"
    ? `${c.dim}"${key}"${c.reset}`
    : `${c.blue}"${key}"${c.reset}`;

  const coloredValue = key === "level"
    ? `${levelColor(level)}"${value}"${c.reset}`
    : colorizeValue(value);

  return `${coloredKey}${c.dim}:${c.reset}${coloredValue}`;
}

function colorizeCompact(entry: Record<string, unknown>, level: Level): string {
  const parts = Object.entries(entry).map(([k, v]) => colorizeKeyValue(k, v, level));
  return `${c.dim}{${c.reset}${parts.join(`${c.dim},${c.reset}`)}${c.dim}}${c.reset}`;
}

function colorizeExpanded(entry: Record<string, unknown>, level: Level): string {
  const entries = Object.entries(entry);
  const lines: string[] = [`${c.dim}{${c.reset}`];
  for (let i = 0; i < entries.length; i++) {
    const [k, v] = entries[i];
    const comma = i < entries.length - 1 ? `${c.dim},${c.reset}` : "";
    lines.push(`  ${colorizeKeyValue(k, v, level)}${comma}`);
  }
  lines.push(`${c.dim}}${c.reset}`);
  return lines.join("\n");
}

/**
 * JSONHandler writes a single-line JSON object per record.
 * Suitable for production environments (CloudWatch, ELK, OpenTelemetry).
 *
 * Output shape (syntax-highlighted):
 *   {"level":"info","msg":"server started","time":"2026-04-11T10:00:00.000Z","port":8080}
 *
 * Routing:
 *   debug/info → stdout
 *   warn/error → stderr
 */
export class JSONHandler implements Handler {
  private readonly expand: boolean;
  private readonly color: boolean;

  constructor({ expand, color }: { expand?: boolean; color?: boolean } = {}) {
    this.expand = expand ?? false;
    this.color = color ?? Deno.stdout.isTerminal();
  }

  Handle(record: LogRecord): void {
    const entry: Record<string, unknown> = {
      level: record.level,
      msg: record.msg,
      time: record.time.toISOString(),
      ...record.attrs,
    };

    const shouldExpand = record.expand ?? this.expand;
    let line: string;
    if (this.color) {
      line = shouldExpand
        ? colorizeExpanded(entry, record.level)
        : colorizeCompact(entry, record.level);
    } else {
      line = shouldExpand
        ? JSON.stringify(entry, null, 2)
        : JSON.stringify(entry);
    }
    const out = record.level === "warn" || record.level === "error"
      ? console.error
      : console.log;
    out(line);
  }
}
