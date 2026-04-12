/**
 * cutie — a minimal, pretty structured logger for Deno.
 *
 * Inspired by Go's log/slog. Two handlers, one logger, one banner.
 *
 * Usage:
 *   import * as cutie from "@race-conditioned/cutie"
 *
 *   const log = cutie.New(
 *     stage === "local"
 *       ? new cutie.PrettyHandler()
 *       : new cutie.JSONHandler()
 *   )
 *
 *   log.info("server started", { port: 8080 })
 *
 *   cutie.PrintBanner("my-app", cfg, ["port", "stage", "store"])
 */

export type { Handler, LogRecord, Level } from "./handler.ts";
export { Logger, New } from "./logger.ts";
export { JSONHandler } from "./json_handler.ts";
export { PrettyHandler } from "./pretty_handler.ts";
export { PrintBanner, PrintListening } from "./banner.ts";
export { PrintAccess } from "./access.ts";
export type { AccessRecord } from "./access.ts";
