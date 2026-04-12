import { c } from "./_colors.ts";

export type AccessRecord = {
  method: string;
  path: string;
  status: number;
  ms: number;
};

function methodColor(method: string): string {
  switch (method) {
    case "GET":    return c.cyan;
    case "POST":   return c.blue;
    case "PUT":    return c.yellow;
    case "DELETE": return c.magenta;
    default:       return c.white;
  }
}

function statusColor(status: number): string {
  if (status >= 500) return c.red;
  if (status >= 400) return c.yellow;
  if (status >= 300) return c.yellow;
  return c.cyan;
}

/**
 * PrintAccess writes a colored HTTP access log line to stdout.
 * Intended for local/dev use — in production, use log.info() instead.
 *
 *   →  GET     /registers                   200  2ms
 *   →  POST    /registers                   201  15ms
 *   →  DELETE  /registers/01K.../aspects    204  0ms
 */
export function PrintAccess(record: AccessRecord): void {
  const m   = `${methodColor(record.method)}${record.method.padEnd(7)}${c.reset}`;
  const p   = `${c.white}${record.path}${c.reset}`;
  const s   = `${statusColor(record.status)}${c.bold}${record.status}${c.reset}`;
  const dur = `${c.dim}${record.ms}ms${c.reset}`;
  console.log(`  ${c.cyan}→${c.reset}  ${m}  ${p}  ${s}  ${dur}`);
}
