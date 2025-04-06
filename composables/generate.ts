import { generateClient } from "~/utils/generate-clients/generate-clients";
import { generateTanstack } from "~/utils/generate-tanstack";
import { downloadZip } from "./download-zip";
import { downloadFile } from "./download-file";

export async function generate(
  fileContent: string,
  module: string,
  withTanstack: boolean
) {
  const exceptClasses = ["ApiException"];

  // GenerateClient
  const content = generateClient(fileContent, exceptClasses);
  console.log("<==================Complete Generate Client==================>");

  const moduleName = module.toLowerCase();
  const clientContent = await formatContent(content);
  const baseFiles = [
    { name: `${moduleName}.client.ts`, content: clientContent },
  ];

  if (withTanstack) {
    // GenerateTanstack
    const {
      clientQueriesContent,
      indexContent,
      mutateQueriesContent,
      mutationsContent,
      queriesContent,
      queryKeysContent,
    } = generateTanstack(fileContent, moduleName, exceptClasses);

    baseFiles[1] = { name: "index.ts", content: indexContent };

    const capitalizedModule =
      moduleName.split(".")[0].charAt(0).toUpperCase() +
      moduleName.split(".")[0].slice(1);

    const additionalFiles = [
      {
        name: `${moduleName.split(".")[0]}-query-keys.ts`,
        content: queryKeysContent,
      },
      {
        name: `useQuery${capitalizedModule}.ts`,
        content: clientQueriesContent,
      },
      {
        name: `useMutate${capitalizedModule}.ts`,
        content: mutateQueriesContent,
      },
      {
        name: `${moduleName.split(".")[0]}-mutations.ts`,
        content: mutationsContent,
      },
      {
        name: `${moduleName.split(".")[0]}-queries.ts`,
        content: queriesContent,
      },
    ];

    downloadZip(moduleName, [...baseFiles, ...additionalFiles]);
  } else {
    // Download each file individually
    baseFiles.forEach(({ name, content }) => downloadFile(name, content));
  }

  console.log("<==================Generated Successfully==================>");
}
