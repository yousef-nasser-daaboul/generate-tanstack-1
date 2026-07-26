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

  content += `
    import axios from "axios";
    import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
  `;

  // clientFunctionsGenerated declares `ApiClientBase` as a class, and classes
  // (unlike function declarations) aren't hoisted with their body, so it must
  // appear before the generated classes that `extends` it.
  content += clientFunctionsGenerated;

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

  return content;
}
