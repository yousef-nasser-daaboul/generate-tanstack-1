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
import { skipInterfaces } from "~/client-config";

export function generateClient(fileContent: string): string {
  let content = clientStartGenerated;

  const classes = extractClassDetails(fileContent);
  content += generateClasses(classes);

  const interfaces = extractInterfaceDetails(fileContent);

  content += generateInterfaces(interfaces);

  const enums = extractEnumDetails(fileContent);

  for (const enumInfo of enums) {
    if (!skipInterfaces.some((pattern) => pattern.test(enumInfo.name))) {
      content += enumInfo.code;
    }
  }

  content += clientFunctionsGenerated;

  return content;
}
