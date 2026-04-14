/**
 * Core types for cutie's handler-based logging architecture.
 * Mirrors Go's slog.Handler interface.
 */

export type Level = "debug" | "info" | "warn" | "error";

export type LogRecord = {
  level: Level;
  msg: string;
  time: Date;
  attrs: Record<string, unknown>;
  expand?: boolean;
};

/**
 * Handler processes a LogRecord.
 *
 * Go equivalent:
 *   type Handler interface {
 *     Handle(ctx context.Context, r slog.Record) error
 *   }
 */
export interface Handler {
  Handle(record: LogRecord): void;
}
