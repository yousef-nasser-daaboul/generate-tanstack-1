import { extractClassDetails } from "../ast/extract-metadata";
import { generateClientQueries } from "./generate-queries-builder";
import { generateIndex } from "./generate-index";
import { generateMutateQueries } from "./generate-mutations-builder";
import { generateQueryKeys } from "./generate-query-keys";
import { generateMutations } from "./generate-mutations";
import { generateQueries } from "./generate-queries";

export function generateTanstack(
  fileContent: string,
  clientName: string,
  exceptClasses: string[],
  exceptedTypes: string[],
  replacementTypes: [string, string][]
) {
  const astObj = extractClassDetails(fileContent, exceptClasses);

  const indexContent = generateIndex(astObj, clientName);
  const queryKeysContent = generateQueryKeys(astObj, clientName);
  const clientQueriesContent = generateClientQueries(
    astObj,
    clientName,
    exceptedTypes,
    replacementTypes
  );
  const mutateQueriesContent = generateMutateQueries(
    astObj,
    clientName,
    exceptedTypes,
    replacementTypes
  );
  const mutationsContent = generateMutations(astObj, clientName);
  const queriesContent = generateQueries(astObj, clientName);

  return {
    indexContent,
    queryKeysContent,
    clientQueriesContent,
    mutateQueriesContent,
    mutationsContent,
    queriesContent,
  };
}
