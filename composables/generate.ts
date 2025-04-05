import { generateClient } from "~/utils/generate-clients/generate-clients";
import prettier from "prettier/standalone";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";
import JSZip from "jszip";
import { generateTanstack } from "~/utils/generate-tanstack";

export async function generate(module: string) {
  // Download Module
  const fileContent = await downloadModule(module);
  console.log("<==================Complete Download Client==================>");

  if (!fileContent) return;

  // GenerateClient
  const content = generateClient(fileContent);
  console.log("<==================Complete Generate Client==================>");

  // GenerateTanstack
  const {
    clientQueriesContent,
    indexContent,
    mutateQueriesContent,
    mutationsContent,
    queriesContent,
    queryKeysContent,
  } = generateTanstack(fileContent, module.toLowerCase());

  // Write File
  const contentFiles = [
    { name: `${module.toLowerCase()}.client.ts`, content },
    { name: "index.ts", content: indexContent },
    {
      name: `${module.toLowerCase().split(".")[0]}-query-keys.ts`,
      content: queryKeysContent,
    },
    {
      name: `useQuery${module.toLowerCase().split(".")[0].charAt(0).toUpperCase() + module.toLowerCase().split(".")[0].slice(1)}.ts`,
      content: clientQueriesContent,
    },
    {
      name: `useMutate${module.toLowerCase().split(".")[0].charAt(0).toUpperCase() + module.toLowerCase().split(".")[0].slice(1)}.ts`,
      content: mutateQueriesContent,
    },
    {
      name: `${module.toLowerCase().split(".")[0]}-mutations.ts`,
      content: mutationsContent,
    },
    {
      name: `${module.toLowerCase().split(".")[0]}-queries.ts`,
      content: queriesContent,
    },
  ];
  downloadZip(module.toLowerCase(), contentFiles);
  console.log("<==================Generated Successfully==================>");
}

async function downloadModule(module: string) {
  const response = await fetch(
    `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
  );

  if (!response.ok) {
    throw new Error(`Failed to download module: ${response.statusText}`);
  }
  return await response.text();
}

const downloadZip = async (
  clientName: string,
  contentFiles: { name: string; content: string }[],
  withFormat: boolean = true
) => {
  const zip = new JSZip();

  // Add folder
  const folder = zip.folder(`${clientName}-generated`);

  if (folder && contentFiles.length > 0) {
    const tanstackFolder = folder.folder(`tanstack`); // Place tanstackFolder inside folder

    // Handle the first file separately
    const firstFile = contentFiles[0];
    const formattedFirstContent = withFormat
      ? await prettier.format(firstFile.content, {
          parser: "typescript",
          plugins: [parserTypescript, parserEstree],
          singleQuote: true,
          trailingComma: "all",
        })
      : firstFile.content;

    folder.file(firstFile.name, formattedFirstContent);

    if (tanstackFolder) {
      // Handle the rest of the files and place them in tanstackFolder
      for (let i = 1; i < contentFiles.length; i++) {
        const file = contentFiles[i];
        const formattedContent = withFormat
          ? await prettier.format(file.content, {
              parser: "typescript",
              plugins: [parserTypescript, parserEstree],
              singleQuote: true,
              trailingComma: "all",
            })
          : file.content;

        tanstackFolder.file(file.name, formattedContent);
      }
    }

    // Generate ZIP and download
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated.zip";
    link.click();
  }
};
