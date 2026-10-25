import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// cli/generate.ts, run as a real child process under `tsx` rather than
// imported in-process. This is deliberate, not incidental: extract-metadata.ts
// imports the real `typescript` package (CommonJS, reads __filename/__dirname
// at module-load time) — Nitro's bundler inlines everything, including
// node_modules, into one ESM chunk in both dev and prerendered production
// builds, which strips those globals and crashes. Shelling out guarantees
// `typescript` only ever loads in a genuine, unbundled Node process — the one
// that already works — while still calling the exact same generate()
// implementation the browser UI uses, just out-of-process instead of
// in-process. `tsx` is what makes running the .ts source directly possible:
// it resolves this codebase's extensionless relative imports (the existing
// convention throughout, otherwise only resolved by Vite/Nuxt's bundler) and
// transforms real TS constructs (enums) that plain Node can't run un-stripped.
//
// Paths are resolved from process.cwd(), with env var overrides — not from
// this file's own import.meta.url (Nitro relocates this module into a bundled
// chunk at a different depth in dev vs. prerendered production builds) and
// not via Nuxt's runtimeConfig (its build step silently rewrites absolute
// paths under the project root for deploy-portability, which mangles them).
// process.cwd() is what's actually stable: the server is always run with the
// tool's own directory as the working directory, in dev, local preview, and
// any deployment that ships this repo alongside the build.
function resolveFromCwd(envVar: string, relativePath: string) {
  const override = process.env[envVar];
  if (override) return override;
  const fromCwd = resolve(process.cwd(), relativePath);
  if (existsSync(fromCwd)) return fromCwd;
  throw new Error(
    `Could not find ${relativePath} relative to cwd (${process.cwd()}). Run the server from the generated-apis project directory, or set ${envVar}.`
  );
}

interface GenerateOptions {
  fileContent: string;
  module: string;
  withTanstack: boolean;
  withoutFormatting?: boolean;
}

export async function runGenerateCli({ fileContent, module, withTanstack, withoutFormatting }: GenerateOptions) {
  const tsxPath = resolveFromCwd("GENERATE_TSX_PATH", "node_modules/.bin/tsx");
  const cliPath = resolveFromCwd("GENERATE_CLI_PATH", "cli/generate.ts");

  const args = [cliPath, "--module", module];
  if (withTanstack) args.push("--with-tanstack");
  if (withoutFormatting) args.push("--without-formatting");

  return await new Promise((resolvePromise, reject) => {
    const child = spawn(tsxPath, args, { stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code: number | null) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `generate CLI exited with code ${code}`));
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout));
      } catch (err) {
        reject(new Error(`Failed to parse generate CLI output: ${(err as Error).message}`));
      }
    });
    child.stdin.write(fileContent);
    child.stdin.end();
  });
}
