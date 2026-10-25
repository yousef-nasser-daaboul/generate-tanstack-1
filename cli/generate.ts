#!/usr/bin/env node
// Runs the exact same generate() the browser UI calls, out-of-process. This is
// deliberate, not incidental: extract-metadata.ts imports the real `typescript`
// package (CommonJS, reads __filename/__dirname at load time) to AST-parse the
// pasted client — Nitro's bundler inlines everything, including node_modules,
// into one ESM chunk in both dev and prerendered production builds, which
// strips those globals and crashes. Running this under `tsx` (via a real child
// process, see server/utils/run-generate-cli.ts) keeps `typescript` in a
// genuine, unbundled Node process, and `tsx` is also what lets this file's own
// extensionless relative imports (the existing convention throughout this
// codebase, resolved by Vite/Nuxt's bundler at every other call site) resolve
// under plain Node, which lacks that resolution behavior natively.
//
// Must be `.ts`, not `.mjs`: tsx's loader hooks apply to imports made FROM a
// .ts/.tsx entry file, but don't reliably intercept imports made from a plain
// .mjs entry (verified empirically — the same import resolves fine from here
// and fails from an otherwise-identical .mjs file).
import { generate } from '../composables/generate.ts'

function parseArgs(argv: string[]) {
  const options = { module: undefined as string | undefined, withTanstack: false, withoutFormatting: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--module') options.module = argv[++i]
    else if (arg === '--with-tanstack') options.withTanstack = true
    else if (arg === '--without-formatting') options.withoutFormatting = true
  }
  return options
}

async function readStdin() {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (!options.module) {
    process.stderr.write('Usage: generate.ts --module <name> [--with-tanstack] [--without-formatting] < input.ts\n')
    process.exitCode = 1
    return
  }

  const fileContent = await readStdin()

  // generate()/generateTanstack() call console.log for progress messages —
  // redirect those to stderr for the duration of the call so stdout carries
  // only the JSON result, the same discipline deps-graph's CLI follows.
  const originalLog = console.log
  console.log = (...args: unknown[]) => process.stderr.write(`${args.join(' ')}\n`)
  let files
  try {
    files = await generate(fileContent, options.module, options.withTanstack, options.withoutFormatting)
  } finally {
    console.log = originalLog
  }

  process.stdout.write(JSON.stringify({ files }))
}

main().catch((err) => {
  process.stderr.write(`${err.stack ?? String(err)}\n`)
  process.exitCode = 1
})
