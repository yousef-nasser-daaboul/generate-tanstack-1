import * as prettierModule from "prettier/standalone";
import * as parserTypescriptModule from "prettier/plugins/typescript";
import * as parserEstreeModule from "prettier/plugins/estree";

// Namespace import + `.default ?? namespace` rather than a plain default
// import: Vite/Rollup (the browser bundle) nests these ESM-only packages'
// real exports under `.default` as expected, but tsx's CJS interop (used to
// run this same code as a subprocess, see cli/generate.ts) flattens them
// directly onto the namespace instead. This fallback is a no-op under Vite —
// `.default` is always present there — and only takes effect under tsx.
const prettier = (prettierModule as any).default ?? prettierModule;
const parserTypescript = (parserTypescriptModule as any).default ?? parserTypescriptModule;
const parserEstree = (parserEstreeModule as any).default ?? parserEstreeModule;

export async function formatContent(content: string) {
  return await prettier.format(content, {
    parser: "typescript",
    plugins: [parserTypescript, parserEstree],
    singleQuote: true,
    trailingComma: "all",
  });
}
