import type { Handler, LogRecord } from "./handler.ts";

/**
 * JSONHandler writes a single-line JSON object per record.
 * Suitable for production environments (CloudWatch, ELK, OpenTelemetry).
 *
 * Output shape:
 *   {"level":"info","msg":"server started","time":"2026-04-11T10:00:00.000Z","port":8080}
 *
 * Routing:
 *   debug/info → stdout
 *   warn/error → stderr
 */
export class JSONHandler implements Handler {
  Handle(record: LogRecord): void {
    const entry = {
      level: record.level,
      msg: record.msg,
      time: record.time.toISOString(),
      ...record.attrs,
    };

    const line = JSON.stringify(entry);
    const out = record.level === "warn" || record.level === "error"
      ? console.error
      : console.log;
    out(line);
  }
}
