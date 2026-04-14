/**
 * showcase.ts — run with `deno run showcase.ts` to see every log output cutie can produce.
 */

import {
  JSONHandler,
  New,
  PrettyHandler,
  PrintAccess,
  PrintBanner,
  PrintListening,
} from "./mod.ts";

// ── PrettyHandler ──────────────────────────────────────────────────────────────

console.log("\n── PrettyHandler ─────────────────────────────────────────\n");

const pretty = New(new PrettyHandler());

pretty.debug("cache miss", { key: "user:42", ttl: 300 });
pretty.info("server started", { port: 8080, stage: "local" });
pretty.warn("pool exhausted", { active: 50, max: 50 });
pretty.error("query failed", { err: "connection refused", db: "postgres" });

// ── PrettyHandler with .With() ─────────────────────────────────────────────────

console.log("\n── PrettyHandler + With() ────────────────────────────────\n");

const svc = pretty.With({ service: "billing", requestId: "req_abc123" });

svc.info("charge created", { amount: 4999, currency: "usd" });
svc.error("refund failed", { err: "insufficient funds", chargeId: "ch_xyz" });

// ── JSONHandler (compact, default) ─────────────────────────────────────────────

console.log("\n── JSONHandler (compact) ────────────────────────────────\n");

const json = New(new JSONHandler());

json.debug("cache miss", { key: "user:42", ttl: 300 });
json.info("server started", { port: 8080, stage: "local" });
json.warn("pool exhausted", { active: 50, max: 50 });
json.error("query failed", { err: "connection refused", db: "postgres" });

// ── JSONHandler (expanded) ─────────────────────────────────────────────────────

console.log("\n── JSONHandler (expanded default) ──────────────────────\n");

const jsonExpanded = New(new JSONHandler({ expand: true }));

jsonExpanded.info("server started", { port: 8080, stage: "local" });
jsonExpanded.error("query failed", { err: "connection refused", db: "postgres" });

// ── JSONHandler per-call override ──────────────────────────────────────────────

console.log("\n── JSONHandler per-call override ───────────────────────\n");

console.log("compact default → force expanded:");
json.expanded().info("expanded override", { port: 8080 });

console.log("\nexpanded default → force compact:");
jsonExpanded.compact().warn("compact override", { active: 50, max: 50 });

// ── JSONHandler no-color (production) ──────────────────────────────────────────

console.log("\n── JSONHandler (no color, compact) ─────────────────────\n");

const jsonPlain = New(new JSONHandler({ color: false }));

jsonPlain.info("server started", { port: 8080, stage: "production" });
jsonPlain.error("query failed", { err: "connection refused" });

console.log("\n── JSONHandler (no color, expanded) ────────────────────\n");

const jsonPlainExpanded = New(new JSONHandler({ color: false, expand: true }));

jsonPlainExpanded.info("server started", { port: 8080, stage: "production" });
jsonPlainExpanded.error("query failed", { err: "connection refused" });

// ── JSONHandler with .With() ───────────────────────────────────────────────────

console.log("\n── JSONHandler + With() ─────────────────────────────────\n");

const jsonSvc = json.With({ service: "billing" });

jsonSvc.info("charge created", { amount: 4999 });
jsonSvc.error("refund failed", { err: "insufficient funds" });

// ── PrintBanner — basic ────────────────────────────────────────────────────────

console.log("\n── PrintBanner (all keys) ───────────────────────────────\n");

const cfg = {
  port: 8080,
  stage: "local",
  store: "postgres",
  cacheDriver: "redis",
  logLevel: "debug",
};

PrintBanner("my-app", cfg);

// ── PrintBanner — pick (flat) ──────────────────────────────────────────────────

console.log("── PrintBanner (pick) ──────────────────────────────────\n");

PrintBanner("my-app", cfg, ["stage", "port", "store"]);

// ── PrintBanner — pick (grouped) ───────────────────────────────────────────────

console.log("── PrintBanner (grouped) ───────────────────────────────\n");

PrintBanner("my-app", cfg, [
  ["port", "stage"],
  ["store", "cacheDriver"],
  ["logLevel"],
]);

// ── PrintBanner — long value truncation ────────────────────────────────────────

console.log("── PrintBanner (long value) ────────────────────────────\n");

PrintBanner("my-app", {
  dsn: "postgres://user:password@very-long-hostname.us-east-1.rds.amazonaws.com:5432/mydb",
  stage: "production",
});

// ── PrintListening ─────────────────────────────────────────────────────────────

console.log("── PrintListening ─────────────────────────────────────\n");

PrintListening("http://localhost:8080", 11);
PrintListening("http://localhost:3000");

// ── PrintAccess — method + status matrix ───────────────────────────────────────

console.log("── PrintAccess ────────────────────────────────────────\n");

PrintAccess({ method: "GET", path: "/users", status: 200, ms: 2 });
PrintAccess({ method: "GET", path: "/users/42", status: 304, ms: 1 });
PrintAccess({ method: "POST", path: "/users", status: 201, ms: 15 });
PrintAccess({ method: "PUT", path: "/users/42", status: 200, ms: 8 });
PrintAccess({ method: "DELETE", path: "/users/42/sessions", status: 204, ms: 3 });
PrintAccess({ method: "GET", path: "/admin/secrets", status: 403, ms: 0 });
PrintAccess({ method: "GET", path: "/missing", status: 404, ms: 1 });
PrintAccess({ method: "POST", path: "/webhooks/stripe", status: 500, ms: 230 });
PrintAccess({ method: "PATCH", path: "/users/42", status: 200, ms: 5 });

console.log();
