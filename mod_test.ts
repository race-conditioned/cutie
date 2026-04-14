import { assertEquals, assertMatch } from "jsr:@std/assert";
import { JSONHandler, Logger, New, PrettyHandler, PrintAccess, PrintBanner, PrintListening } from "./mod.ts";
import type { Handler, LogRecord } from "./mod.ts";

// --- helpers ---

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

function capture(fn: () => void): { stdout: string; stderr: string } {
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...args: unknown[]) => stdoutLines.push(args.join(" "));
  console.error = (...args: unknown[]) => stderrLines.push(args.join(" "));
  try {
    fn();
  } finally {
    console.log = origLog;
    console.error = origErr;
  }
  return { stdout: stdoutLines.join("\n"), stderr: stderrLines.join("\n") };
}

// --- Logger ---

Deno.test("Logger.info dispatches record to handler", () => {
  const records: LogRecord[] = [];
  const handler: Handler = { Handle: (r) => records.push(r) };
  const log = New(handler);

  log.info("hello", { foo: "bar" });

  assertEquals(records.length, 1);
  assertEquals(records[0].level, "info");
  assertEquals(records[0].msg, "hello");
  assertEquals(records[0].attrs.foo, "bar");
});

Deno.test("Logger.With merges base attrs into every record", () => {
  const records: LogRecord[] = [];
  const log = New({ Handle: (r) => records.push(r) });

  const scoped = log.With({ requestId: "abc" });
  scoped.info("done", { status: 200 });

  assertEquals(records[0].attrs.requestId, "abc");
  assertEquals(records[0].attrs.status, 200);
});

Deno.test("Logger.With does not mutate parent logger", () => {
  const records: LogRecord[] = [];
  const log = New({ Handle: (r) => records.push(r) });
  log.With({ x: 1 });
  log.info("check");

  assertEquals("x" in records[0].attrs, false);
});

Deno.test("Logger all levels dispatch correct level field", () => {
  const records: LogRecord[] = [];
  const handler: Handler = { Handle: (r) => records.push(r) };
  const log = New(handler);

  log.debug("d");
  log.info("i");
  log.warn("w");
  log.error("e");

  assertEquals(records.map((r) => r.level), ["debug", "info", "warn", "error"]);
});

// --- JSONHandler ---

Deno.test("JSONHandler writes JSON to stdout for info", () => {
  const log = New(new JSONHandler());
  const { stdout } = capture(() => log.info("started", { port: 8080 }));
  const parsed = JSON.parse(stripAnsi(stdout));
  assertEquals(parsed.level, "info");
  assertEquals(parsed.msg, "started");
  assertEquals(parsed.port, 8080);
  assertMatch(parsed.time, /^\d{4}-\d{2}-\d{2}T/);
});

Deno.test("JSONHandler writes to stderr for error", () => {
  const log = New(new JSONHandler());
  const { stdout, stderr } = capture(() => log.error("boom"));
  assertEquals(stdout, "");
  assertMatch(stderr, /boom/);
});

Deno.test("JSONHandler expand option outputs indented JSON", () => {
  const log = New(new JSONHandler({ expand: true }));
  const { stdout } = capture(() => log.info("started", { port: 8080 }));
  const clean = stripAnsi(stdout);
  const parsed = JSON.parse(clean);
  assertEquals(parsed.level, "info");
  assertEquals(parsed.msg, "started");
  assertEquals(parsed.port, 8080);
  assertMatch(clean, /\n/);
  assertMatch(clean, /^\{\n  /);
});

Deno.test("Logger.expanded() overrides compact default", () => {
  const log = New(new JSONHandler());
  const { stdout } = capture(() => log.expanded().info("tall", { x: 1 }));
  const clean = stripAnsi(stdout);
  assertMatch(clean, /\n/);
  const parsed = JSON.parse(clean);
  assertEquals(parsed.msg, "tall");
});

Deno.test("Logger.compact() overrides expanded default", () => {
  const log = New(new JSONHandler({ expand: true }));
  const { stdout } = capture(() => log.compact().info("flat", { x: 1 }));
  const clean = stripAnsi(stdout);
  assertEquals(clean.includes("\n"), false);
  const parsed = JSON.parse(clean);
  assertEquals(parsed.msg, "flat");
});

Deno.test("JSONHandler color:false outputs plain JSON with no ANSI", () => {
  const log = New(new JSONHandler({ color: false }));
  const { stdout } = capture(() => log.info("started", { port: 8080 }));
  assertEquals(stdout, stripAnsi(stdout));
  const parsed = JSON.parse(stdout);
  assertEquals(parsed.level, "info");
  assertEquals(parsed.msg, "started");
  assertEquals(parsed.port, 8080);
});

Deno.test("JSONHandler color:false expand:true outputs indented plain JSON", () => {
  const log = New(new JSONHandler({ color: false, expand: true }));
  const { stdout } = capture(() => log.info("started", { port: 8080 }));
  assertEquals(stdout, stripAnsi(stdout));
  assertMatch(stdout, /\n/);
  const parsed = JSON.parse(stdout);
  assertEquals(parsed.msg, "started");
});

Deno.test("JSONHandler writes to stderr for warn", () => {
  const log = New(new JSONHandler());
  const { stderr } = capture(() => log.warn("careful"));
  assertMatch(stderr, /careful/);
});

// --- PrettyHandler ---

Deno.test("PrettyHandler includes level and message in output", () => {
  const log = New(new PrettyHandler());
  const { stdout } = capture(() => log.info("hello world"));
  assertMatch(stdout, /INFO/);
  assertMatch(stdout, /hello world/);
});

Deno.test("PrettyHandler includes attrs as key=value", () => {
  const log = New(new PrettyHandler());
  const { stdout } = capture(() => log.info("req", { port: 8080, stage: "local" }));
  assertMatch(stdout, /port=8080/);
  assertMatch(stdout, /stage=local/);
});

Deno.test("PrettyHandler quotes string values containing spaces", () => {
  const log = New(new PrettyHandler());
  const { stderr } = capture(() => log.error("failed", { err: "connection refused" }));
  assertMatch(stderr, /err="connection refused"/);
});

Deno.test("PrettyHandler routes warn/error to stderr", () => {
  const log = New(new PrettyHandler());
  const { stdout, stderr } = capture(() => log.warn("watch out"));
  assertEquals(stdout, "");
  assertMatch(stderr, /WARN/);
});

// --- PrintBanner ---

Deno.test("PrintBanner renders title and all fields when no pick", () => {
  const { stdout } = capture(() =>
    PrintBanner("my-app", { port: 8080, stage: "local" })
  );
  assertMatch(stdout, /my-app/);
  assertMatch(stdout, /port/);
  assertMatch(stdout, /8080/);
  assertMatch(stdout, /stage/);
  assertMatch(stdout, /local/);
});

Deno.test("PrintBanner only shows picked keys", () => {
  const { stdout } = capture(() =>
    PrintBanner("my-app", { port: 8080, stage: "local", secret: "hidden" }, ["port", "stage"])
  );
  assertMatch(stdout, /port/);
  assertMatch(stdout, /stage/);
  assertEquals(stdout.includes("secret"), false);
  assertEquals(stdout.includes("hidden"), false);
});

Deno.test("PrintBanner preserves pick order", () => {
  const { stdout } = capture(() =>
    PrintBanner("app", { b: 2, a: 1 }, ["a", "b"])
  );
  const aPos = stdout.indexOf("a");
  const bPos = stdout.indexOf("b");
  assertEquals(aPos < bPos, true);
});

Deno.test("PrintBanner grouped sections render dividers between groups", () => {
  const { stdout } = capture(() =>
    PrintBanner("app", { port: 8080, stage: "local", limit: 100 }, [
      ["port", "stage"],
      ["limit"],
    ])
  );
  // Both groups present
  assertMatch(stdout, /port/);
  assertMatch(stdout, /limit/);
  // At least 3 ├ dividers: after title + between groups
  const dividerCount = (stdout.match(/├/g) ?? []).length;
  assertEquals(dividerCount >= 2, true);
});

Deno.test("PrintBanner aligns right border for long keys", () => {
  const { stdout } = capture(() =>
    PrintBanner("app", { dynamoAspectRegisterIdIndex: "AT-aspectRegisterIdIndex" })
  );
  // Every content line should have the same length (when ANSI stripped)
  const lines = stdout.split("\n").filter((l) => stripAnsi(l).startsWith("│"));
  const lengths = lines.map((l) => stripAnsi(l).length);
  assertEquals(new Set(lengths).size, 1, "all rows should have equal visible width");
});

// --- PrintAccess ---

Deno.test("PrintAccess includes method, path, status, and duration", () => {
  const { stdout } = capture(() =>
    PrintAccess({ method: "GET", path: "/registers", status: 200, ms: 12 })
  );
  assertMatch(stdout, /GET/);
  assertMatch(stdout, /\/registers/);
  assertMatch(stdout, /200/);
  assertMatch(stdout, /12ms/);
});

Deno.test("PrintAccess shows 0ms without key=value format", () => {
  const { stdout } = capture(() =>
    PrintAccess({ method: "GET", path: "/health", status: 200, ms: 0 })
  );
  assertMatch(stdout, /0ms/);
  assertEquals(stdout.includes("ms="), false);
});

// --- PrintListening ---

Deno.test("PrintListening shows address", () => {
  const { stdout } = capture(() => PrintListening("http://localhost:8080"));
  assertMatch(stdout, /http:\/\/localhost:8080/);
});

Deno.test("PrintListening shows handler count when provided", () => {
  const { stdout } = capture(() => PrintListening("http://localhost:8080", 11));
  assertMatch(stdout, /11 handlers/);
});

Deno.test("PrintListening omits handler count when not provided", () => {
  const { stdout } = capture(() => PrintListening("http://localhost:8080"));
  assertEquals(stdout.includes("handlers"), false);
});
