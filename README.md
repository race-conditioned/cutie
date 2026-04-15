# cutie

A minimal, pretty structured logger. Inspired by Go's `log/slog`.

## Install

```sh
# Deno (JSR)
deno add @race-conditioned/cutie

# npm
npm install @race-conditioned/cutie
```

## Usage

```ts
import * as cutie from "@race-conditioned/cutie";

const log = cutie.New(
  stage === "local"
    ? new cutie.PrettyHandler()
    : new cutie.JSONHandler()
);

log.info("server started", { port: 8080 });
```

## Handlers

### PrettyHandler

Colored, columnar output for local development.

```ts
const log = cutie.New(new cutie.PrettyHandler());

log.debug("cache miss", { key: "user:42", ttl: 300 });
log.info("server started", { port: 8080, stage: "local" });
log.warn("pool exhausted", { active: 50, max: 50 });
log.error("query failed", { err: "connection refused" });
```

```
  DEBUG  cache miss       key=user:42  ttl=300
  INFO   server started   port=8080  stage=local
  WARN   pool exhausted   active=50  max=50
  ERROR  query failed     err="connection refused"
```

### JSONHandler

Syntax-highlighted structured JSON. Color auto-detects based on whether stdout is a TTY — colored in the terminal, plain JSON when piped or in production.

```ts
// Auto-detect color (default)
const log = cutie.New(new cutie.JSONHandler());

// Force color off for production
const log = cutie.New(new cutie.JSONHandler({ color: false }));

// Expanded (multi-line) output
const log = cutie.New(new cutie.JSONHandler({ expand: true }));
```

Compact (default):
```
{"level":"info","msg":"server started","time":"...","port":8080,"stage":"local"}
```

Expanded:
```json
{
  "level": "info",
  "msg": "server started",
  "time": "...",
  "port": 8080,
  "stage": "local"
}
```

## Log levels

Four levels, routed by severity:

| Level | Destination |
|-------|-------------|
| `debug` | stdout |
| `info` | stdout |
| `warn` | stderr |
| `error` | stderr |

## Enriching logs

### With()

Returns a new logger with attributes merged into every subsequent record. Does not mutate the parent.

```ts
const log = cutie.New(new cutie.PrettyHandler());
const svc = log.With({ service: "billing", requestId: "req_abc" });

svc.info("charge created", { amount: 4999 });
// INFO  charge created  service=billing  requestId=req_abc  amount=4999
```

### expanded() / compact()

Override the JSONHandler's default format for a specific call. Returns a new logger, same pattern as `With()`.

```ts
const log = cutie.New(new cutie.JSONHandler());

log.expanded().info("this one is multi-line", { port: 8080 });
log.compact().info("this one is single-line", { port: 8080 });
```

## Utilities

### PrintBanner

Renders a styled startup configuration box.

```ts
cutie.PrintBanner("my-app", config);
cutie.PrintBanner("my-app", config, ["port", "stage"]);
cutie.PrintBanner("my-app", config, [
  ["port", "stage"],
  ["store", "cacheDriver"],
]);
```

```
  +----------------------------+
  |          my-app            |
  +----------------------------+
  |  port          8080        |
  |  stage         local       |
  +----------------------------+
```

### PrintListening

Prints a styled "server is up" line.

```ts
cutie.PrintListening("http://localhost:8080", 11);
```

```
  >  http://localhost:8080  .  11 handlers
```

### PrintAccess

Colored HTTP access log line.

```ts
cutie.PrintAccess({ method: "GET", path: "/users", status: 200, ms: 2 });
```

```
  ->  GET     /users  200  2ms
```

## Showcase

Run the showcase script to see every output variant at a glance:

```sh
deno run showcase.ts
```

## License

MIT
