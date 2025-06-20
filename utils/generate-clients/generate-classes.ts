import { classStructure } from "~/client-config";
import { type ClassDetails } from "../ast/extract-metadata";
import { generateMethods } from "./generate-methods";
import { generateParamsInterfaces } from "./generate-params-interfaces";

export function generateClasses(classes: ClassDetails[]): string {
  let content = `
    import axios from "axios";
    import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
  `;
  for (const classInfo of Object.values(classes)) {
    let classContent = classStructure(
      classInfo,
      generateMethods(classInfo.methods, classInfo.className),
      generateParamsInterfaces(classInfo.methods, classInfo.className)
    );

    content += classContent;
  }

  return content;
}
