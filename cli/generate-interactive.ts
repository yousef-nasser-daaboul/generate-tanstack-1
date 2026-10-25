#!/usr/bin/env node
// Interactive wizard version of cli/generate.ts: asks which system, which
// module, whether to include the vue-query hooks, and where to write the
// result — the same three choices the browser UI's "Select" flow asks via
// dropdowns — then downloads the real generated client from that system's
// backend (downloadModule() below needs no auth, it's a plain unauthenticated
// GET against each system's dev environment) and writes the files straight
// to disk. cli/generate.ts stays as the plumbing the Nitro route shells out
// to (piped raw content in, JSON out); this is the "just run it" entry point
// for a human or an agent, wired up as the root `pnpm generate-api` script.
//
// Prompts are driven off a single readline async iterator (ask() below)
// rather than repeated `rl.question()`/`rl.once('line', ...)` calls: verified
// empirically that only the first of several sequential question()/once()
// calls resolves against non-interactive (piped/redirected) stdin in this
// Node version, silently hanging on the second — the async-iterator form
// doesn't have that problem and works the same way for a real human typing
// at a TTY.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { CLIENTS_BY_PROJECT, downloadModule, Projects } from "../composables/download-module.ts";
import { generate } from "../composables/generate.ts";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string) {
  process.stdout.write(question);
  const { value, done } = await lines.next();
  if (done) throw new Error("stdin closed before an answer was given.");
  return value.trim();
}

async function choose(question: string, options: string[]) {
  console.log(question);
  options.forEach((option, i) => console.log(`  ${i + 1}) ${option}`));
  while (true) {
    const answer = await ask("> ");
    const index = Number(answer) - 1;
    if (Number.isInteger(index) && options[index] !== undefined) return options[index];
    console.log(`Enter a number between 1 and ${options.length}.`);
  }
}

async function confirm(question: string, defaultValue = false) {
  const hint = defaultValue ? "Y/n" : "y/N";
  const answer = (await ask(`${question} (${hint}) `)).toLowerCase();
  if (!answer) return defaultValue;
  return answer.startsWith("y");
}

async function main() {
  const projects = Object.values(Projects);
  const project = (await choose("Which system?", projects)) as Projects;
  const moduleName = await choose(`\nWhich module (${project})?`, CLIENTS_BY_PROJECT[project]);
  const withTanstack = await confirm("\nInclude the vue-query hooks too?");
  const outputDir = await ask("\nWhere should the generated files go? (path) ");

  rl.close();

  if (!outputDir) throw new Error("An output path is required.");

  console.log(`\nDownloading ${moduleName} from ${project}...`);
  const fileContent = await downloadModule(moduleName, project);

  console.log("Generating...");
  const files = await generate(fileContent, moduleName, withTanstack);

  const dir = resolve(process.cwd(), outputDir);
  mkdirSync(dir, { recursive: true });
  for (const file of files) {
    writeFileSync(resolve(dir, file.name), file.content);
    console.log(`  wrote ${file.name}`);
  }
  console.log(`\nDone — ${files.length} file(s) written to ${dir}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack : err);
  process.exitCode = 1;
});
