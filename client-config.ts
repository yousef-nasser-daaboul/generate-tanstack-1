import {
  MethodType,
  type ClassDetails,
  type InterfaceDetails,
  type MethodDetails,
} from "./utils/ast/extract-metadata";
import {
  generateMutateParams,
  generateQueryParams,
} from "./utils/generate-clients/generate-methods";
import {
  checkIfNullable,
  checkIfParamNullable,
  getFirstLetterUpperCase,
  isApiMutate,
} from "./utils/helper/helper";

export const exceptClasses = ["ApiException"];
export const exceptMethods = ["process"];

export const exceptedTypes = [
  "undefined",
  "string[] | undefined",
  "boolean[] | undefined",
  "number[] | undefined",
  "string | undefined",
  "number | undefined",
  "boolean | undefined",
  "string[] | null",
  "boolean[] | null",
  "number[] | null",
  "string | null",
  "number | null",
  "boolean | null",
  "AcceptLanguage",
  "number",
  "string",
  "boolean",
  "(number)",
  "(string)",
  "(boolean)",
];

export const skipInterfaces: [RegExp] = [/\d+$/];

export const replacementTypes: [RegExp, string][] = [
  [/ \| undefined/g, ""],
  [/ \| null/g, ""],
  [/\[\]/g, ""],
  [/\d+$/, ""],
  [/^\(.*\)$/, ""],
];
export const replacementInterfacePropertyType: [RegExp, string][] = [
  [/\s*\d+\s*(?:\|\s*(?:undefined|null))?\s*(?=$|\[\]|\s*[;,\]])/g, ""],
  [/ \| undefined/g, ""],
  [/ \| null/g, ""],
  [/\s*\d+(?=\s*[;,\]|])|\s*\d+$/g, ""],
];

export const replacementPropertiesTypes: [RegExp, string][] = [
  [/\(number \| null\)\[\]/g, "number[]"],
  [/\| undefined/g, ""],
  [/\| null/g, ""],
  [/(\w*?)(\d+)(?=[\s)|,])/g, "$1"],
];

export const replacementMethodReturnType: [RegExp, string][] = [
  [/(\w+?)(\d+)(?=(\[\]|>))/g, "$1"],
];

export const mutateParamsDtoNames = ["body", "dto"];

export const exceptedParameters = [
  "branchIdHeader",
  "signal",
  "accept_Language",
  "x_Idempotence_Key",
  "x_AccountWalletId",
];

// `extract-metadata.ts` imports from this file (for `exceptClasses`), and this
// file imports `MethodType` from `extract-metadata.ts` — that circular import
// means `MethodType` isn't safe to read at module-top-level (it can still be
// undefined while the cycle is resolving), only from inside a function body
// that runs later, once both modules have finished initializing.
function methodTypeToMode(
  methodType: MethodType,
): "query" | "json" | "formData" | "replace" {
  switch (methodType) {
    case MethodType.AddQueryParam:
      return "query";
    case MethodType.Json:
      return "json";
    case MethodType.FormData:
      return "formData";
    case MethodType.Replace:
      return "replace";
  }
}

export function classStructure(
  classInfo: ClassDetails,
  methods: string,
  interfaces: string,
) {
  return `
      export class ${classInfo.className} extends ApiClientBase {
          ${methods}
      }
      ${interfaces}
  `;
}

export function apiStructure(method: MethodDetails, className: string) {
  const isMutate = isApiMutate(method);
  const parameters = isMutate
    ? generateMutateParams(method, className)
    : generateQueryParams(method, className);
  const paramArg = !!parameters ? (isMutate ? "body" : "params") : "undefined";
  const mode = methodTypeToMode(method.methodType);

  return `
      ${method.name}(
          ${parameters}${!!parameters ? "," : ""}
          config?: CustomConfig,
      ): ${getMethodReturnType(method.returnType)} {
          return this._handler("${method.url}", "${method.httpMethod}", ${paramArg}, config, "${mode}");
      }
  `;
}

export function paramInterfaceStructure(
  method: MethodDetails,
  className: string,
) {
  return `
        export interface I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}${isApiMutate(method) ? "Dto" : "Params"} {
            ${method.params
              .filter((param) => !exceptedParameters.includes(param.paramName))
              .map(
                (param) =>
                  `${param.paramName}${checkIfParamNullable(param.paramType)}: ${getInterfaceProperty(param.paramType)}`,
              )
              .join(", ")}
        }
    `;
}

function getInterfaceProperty(paramType: string) {
  for (const [target, replacement] of replacementPropertiesTypes) {
    paramType = paramType.replace(target, replacement);
  }
  return paramType;
}

function getMethodReturnType(returnType: string) {
  // console.log("before", returnType);
  for (const [target, replacement] of replacementMethodReturnType) {
    returnType = returnType.replace(target, replacement);
  }
  // console.log("after", returnType);
  return returnType;
}

export function interfaceStructure(interfaceInfo: InterfaceDetails) {
  return `export interface ${interfaceInfo.interfaceName} {
        ${interfaceInfo.attributes
          .map((attribute) => {
            return `${attribute.isReadonly ? "readonly" : ""} ${attribute.name}${checkIfNullable(attribute.type)}:
              ${replacementInterfacePropertyType.reduce(
                (type, [pattern, to]) => type.replace(pattern, to),
                attribute.type,
              )}`;
          })
          .join(";")}
    }`;
}
