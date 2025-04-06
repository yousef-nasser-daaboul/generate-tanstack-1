import { generateClient } from "~/utils/generate-clients/generate-clients";
import { generateTanstack } from "~/utils/generate-tanstack";
import { downloadZip } from "./download-zip";

export function generate(fileContent: string, module: string) {
  const exceptClasses = ["ApiException"];
  // GenerateClient
  const content = generateClient(fileContent, exceptClasses);
  console.log("<==================Complete Generate Client==================>");

  // GenerateTanstack
  const {
    clientQueriesContent,
    indexContent,
    mutateQueriesContent,
    mutationsContent,
    queriesContent,
    queryKeysContent,
  } = generateTanstack(fileContent, module.toLowerCase(), exceptClasses);

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
