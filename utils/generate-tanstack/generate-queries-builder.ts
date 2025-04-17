import {
  HttpMethod,
  type ClassDetails,
  type MethodDetails,
  type ParamDetails,
} from "../ast/extract-metadata";
import { checkIfAllParamsNullable } from "../generate-clients/generate-methods";
import { getFirstLetterUpperCase } from "../helper/helper";
import { generateQueryPathValue } from "./generate-query-keys";

export function generateClientQueries(
  astObj: ClassDetails[],
  clientName: string,
  exceptedTypes: string[],
  replacementTypes: [string, string][]
) {
  // Generate Imports
  let content = `import type { Ref } from "vue"; import { useQueryBuilder } from "~base/composables/useQueryBuilder"; import {`;

  if (astObj.length > 0) {
    content += astObj.map((obj) => generateClientObj(obj.className)).join(",");
    // content += `} from "~mig/utils/${clientName.replace(".", "/")}";`;
    content += `} from ".";`;
  }

  if (astObj.length > 0) {
    // Import
    const paramTypeSet = new Set<string>();
    astObj.forEach((classDetail) => {
      classDetail.methods
        .filter((method) => method.httpMethod === HttpMethod.GET)
        .forEach((method) => {
          method.params
            .filter(
              (param) =>
                param.paramType && !exceptedTypes.includes(param.paramType)
            )
            .forEach((param) => {
              const cleanedType = replacementTypes.reduce(
                (type, [from, to]) => type.replaceAll(from, to),
                param.paramType
              );
              paramTypeSet.add(cleanedType);
            });
        });
    });
    content += "import type {";
    content += Array.from(paramTypeSet).join(",");
    content += `} from "../${clientName.replace(".", "/")}.client";`;

    // Import Filters Types
    content += "import type {";

    content += astObj
      .flatMap((classDetail) => {
        return classDetail.methods
          .filter(
            (method) =>
              method.httpMethod === HttpMethod.GET && method.params.length > 1
          )
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            return `I${className}${getFirstLetterUpperCase(method.name)}Params`;
          });
      })
      .join(", ");

    content += `} from "../${clientName.replace(".", "/")}.client";`;
  }
  const queryKeysName = `${clientName.split(".")[0].toUpperCase()}_QUERY_KEYS`;
  // content += `import {${queryKeysName}} from "~mig/utils/${clientName.replace(".", "/")}/${clientName.split(".")[0]}-query-keys";\n\n`;
  content += `import {${queryKeysName}} from "./${clientName.split(".")[0]}-query-keys";\n\n`;

  // Generate Client Queries
  content += astObj
    .map((classDetail) => {
      return classDetail.methods
        .filter((method) => method.httpMethod === HttpMethod.GET)
        .map((method) => {
          const className = classDetail.className.replace("Client", "");
          const methodName = method.name.replace("get", "");
          const clientNameUpdated = clientName.split(".")[0].toUpperCase();

          return `export const useGet${className}${methodName} =
           (${generateQueryFunctionParams(method, className)}) => 
             useQueryBuilder({
              prefix:"get${className}${methodName}",
              defaultOptions: {
                queryKey:[${clientNameUpdated}_QUERY_KEYS.${generateQueryPathValue(classDetail, method)},${generateQueryKeyParams(method.params)}],
                queryFn:()=>${generateClientObj(classDetail.className)}.${method.name}(${generateQueryFnAssignParams(method.params)})
              },
            });
          `;
        })
        .join("\n");
    })
    .join("\n");

  return content;
}

function generateQueryKeyParams(params: ParamDetails[]) {
  if (params.length > 1) {
    return `filters?.value`;
  }
  return params
    .filter((param) => param.paramName !== "body" && param.paramName !== "data")
    .map((param) => `${param.paramName}?.value`)
    .join(",");
}
function generateQueryFunctionParams(method: MethodDetails, className: string) {
  if (method.params.length > 1) {
    return `filters${checkIfAllParamsNullable(method.params)}:Ref<I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Params>`;
  }
  return `${method.params.map((param) => `${param.paramName}: Ref<${param.paramType}>`).join(",")}`;
}

function generateQueryFnAssignParams(params: ParamDetails[]) {
  let content = "";
  if (params.length > 1) {
    content += `filters?.value`;
  } else if (params.length > 0) {
    content += `{${params.map((param) => `${param.paramName === "body" || param.paramName === "data" ? "..." : param.paramName + ":"}${param.paramName}.value`).join(",")}}`;
  }
  return content;
}

export function generateClientObj(className: string) {
  return className.charAt(0).toLowerCase() + className.slice(1);
}
