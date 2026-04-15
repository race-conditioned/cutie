import { build, emptyDir } from "jsr:@deno/dnt";

const version = Deno.args[0] || "0.2.1";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  postBuild() {
    Deno.copyFileSync("README.md", "npm/README.md");
  },
  shims: {
    deno: true,
  },
  test: false,
  scriptModule: "cjs",
  compilerOptions: {
    lib: ["ES2022"],
    target: "ES2022",
  },
  package: {
    name: "@race-conditioned/cutie",
    version,
    description: "A minimal, pretty structured logger. Inspired by Go's log/slog.",
    license: "MIT",
    keywords: ["logger", "structured", "slog", "pretty", "json"],
  },
});
