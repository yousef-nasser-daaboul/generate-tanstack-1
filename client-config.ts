import {
  MethodType,
  type ClassDetails,
  type InterfaceDetails,
  type MethodDetails,
} from "./utils/ast/extract-metadata";
import {
  generateHeaders,
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
  "AcceptLanguage",
];
export const replacementTypes: [string, string][] = [
  [" | undefined", ""],
  ["[]", ""],
];

export const replacementPropertiesTypes: [string, string][] = [
  ["(number | null)[]", "number[]"],
  ["| undefined", ""],
];

export const mutateParamsDtoNames = ["body", "dto"];

export const exceptedParameters = [
  "branchIdHeader",
  "signal",
  "accept_Language",
  "x_Idempotence_Key",
];

export function classStructure(
  classInfo: ClassDetails,
  methods: string,
  interfaces: string
) {
  return `
      export class ${classInfo.className} {
          protected instance: AxiosInstance;
          protected baseUrl: string;

          constructor(baseUrl?: string, instance?: AxiosInstance) {
              this.instance = instance || axios.create();

              this.baseUrl = baseUrl ?? "";
          }
          
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
  const headers = generateHeaders(method);

  return `
      ${method.name}(
          ${parameters}${!!parameters ? "," : ""}
          headers?:Record<string,string>,
          signal?:AbortSignal
      ): ${method.returnType} {
          let url_ = this.baseUrl + "${method.url}";
           url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, params)" : 'url_.replace(/[?&]$/, "")'};

          ${
            !!parameters && isApiMutate(method)
              ? `const content_ = ${
                  method.methodType === MethodType.FormData
                    ? "objectToFormData"
                    : "JSON.stringify"
                }(body);`
              : ""
          }
          
          const options_: AxiosRequestConfig = {
              ${!!parameters && isMutate ? "data: content_," : ""}
              method: "${method.httpMethod}",
              url: url_,
              headers: {
                ${headers}${!!headers ? "," : ""}
                ...headers,
              },
              signal
          };

          return this.instance.request(options_).then(process);
      }
  `;
}

export function paramInterfaceStructure(
  method: MethodDetails,
  className: string
) {
  return `
        export interface I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}${isApiMutate(method) ? "Dto" : "Params"} {
            ${method.params
              .filter((param) => !exceptedParameters.includes(param.paramName))
              .map(
                (param) =>
                  `${param.paramName}${checkIfParamNullable(param.paramType)}: ${getInterfaceProperty(param.paramType)}`
              )
              .join(", ")}
        }
    `;
}

function getInterfaceProperty(paramType: string) {
  for (const [target, replacement] of replacementPropertiesTypes) {
    paramType = paramType.replaceAll(target, replacement);
  }
  return paramType;
}

export function interfaceStructure(interfaceInfo: InterfaceDetails) {
  return `export interface ${interfaceInfo.interfaceName} {
        ${interfaceInfo.attributes
          .map(
            (attribute) =>
              `${attribute.isReadonly ? "readonly" : ""} ${attribute.name}${checkIfNullable(attribute.type)}: ${attribute.type.replace(/\|\s*(undefined|null)/g, "")}`
          )
          .join(";")}
    }`;
}
