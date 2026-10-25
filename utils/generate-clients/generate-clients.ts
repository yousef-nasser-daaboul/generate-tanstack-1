import {
  extractClassDetails,
  extractInterfaceDetails,
} from "../ast/extract-metadata";
import { extractEnumDetails } from "../ast/extract-metadata";
import {
  clientFunctionsGenerated,
  clientStartGenerated,
  fileParameterGenerated,
} from "../helper/client-functions-generated";
import { generateInterfaces } from "./generate-interfaces";
import { generateClasses } from "./generate-classes";
import { skipInterfaces } from "../../client-config";

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

  // NSwag only sometimes emits FileParameter (newer toolchains leave it out),
  // but the generated params interfaces still reference it for multipart
  // uploads. Declare it here whenever it's used and the input didn't.
  const declaresFileParameter = interfaces.some(
    (interfaceInfo) => interfaceInfo.interfaceName === "FileParameter"
  );
  if (!declaresFileParameter && /\bFileParameter\b/.test(content)) {
    content += fileParameterGenerated;
  }

  const enums = extractEnumDetails(fileContent);

  for (const enumInfo of enums) {
    if (!skipInterfaces.some((pattern) => pattern.test(enumInfo.name))) {
      content += enumInfo.code;
    }
  }

  return content;
}
