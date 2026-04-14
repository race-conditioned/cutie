import type { Handler, Level, LogRecord } from "./handler.ts";

/**
 * Logger dispatches structured log records to a Handler.
 *
 * Go equivalent:
 *   type Logger struct { handler slog.Handler }
 *   func (l *Logger) Info(msg string, args ...any) { ... }
 */
export class Logger {
  constructor(
    private readonly handler: Handler,
    private readonly baseAttrs: Record<string, unknown> = {},
    private readonly expand?: boolean,
  ) {}

  debug(msg: string, attrs?: Record<string, unknown>): void {
    this.emit("debug", msg, attrs);
  }

  info(msg: string, attrs?: Record<string, unknown>): void {
    this.emit("info", msg, attrs);
  }

  warn(msg: string, attrs?: Record<string, unknown>): void {
    this.emit("warn", msg, attrs);
  }

  error(msg: string, attrs?: Record<string, unknown>): void {
    this.emit("error", msg, attrs);
  }

  /**
   * Returns a new Logger with the given attrs merged into every subsequent record.
   *
   * Go equivalent:
   *   logger.With("requestId", id, "userId", uid)
   */
  With(attrs: Record<string, unknown>): Logger {
    return new Logger(this.handler, { ...this.baseAttrs, ...attrs }, this.expand);
  }

  /** Returns a Logger that forces expanded (multi-line) output for handlers that support it. */
  expanded(): Logger {
    return new Logger(this.handler, this.baseAttrs, true);
  }

  /** Returns a Logger that forces compact (single-line) output for handlers that support it. */
  compact(): Logger {
    return new Logger(this.handler, this.baseAttrs, false);
  }

  private emit(level: Level, msg: string, attrs?: Record<string, unknown>): void {
    const record: LogRecord = {
      level,
      msg,
      time: new Date(),
      attrs: { ...this.baseAttrs, ...attrs },
      expand: this.expand,
    };
    this.handler.Handle(record);
  }
}

/**
 * New creates a Logger backed by the given handler.
 *
 * Go equivalent:
 *   slog.New(handler)
 */
export function New(handler: Handler): Logger {
  return new Logger(handler);
}
