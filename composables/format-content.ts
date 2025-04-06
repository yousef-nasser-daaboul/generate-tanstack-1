import prettier from "prettier/standalone";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";

export async function formatContent(content: string) {
  return await prettier.format(content, {
    parser: "typescript",
    plugins: [parserTypescript, parserEstree],
    singleQuote: true,
    trailingComma: "all",
  });
}
