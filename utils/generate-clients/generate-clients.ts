import {
  extractClassDetails,
  extractInterfaceDetails,
} from "../ast/extract-metadata";
import { extractEnumDetails } from "../ast/extract-metadata";
import {
  clientFunctionsGenerated,
  clientStartGenerated,
} from "../helper/client-functions-generated";
import { generateInterfaces } from "./generate-interfaces";
import { generateClasses } from "./generate-classes";

export function generateClient(
  fileContent: string,
): string {
  let content = clientStartGenerated;

  const classes = extractClassDetails(fileContent);
  content += generateClasses(classes);

  const interfaces = extractInterfaceDetails(fileContent);

  content += generateInterfaces(interfaces);

  const enums = extractEnumDetails(fileContent);

  for (const enumInfo of enums) {
    content += enumInfo.code;
  }

  content += clientFunctionsGenerated;

  return content;
}
