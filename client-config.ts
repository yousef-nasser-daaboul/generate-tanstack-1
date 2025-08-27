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
          protected transformUrl: (url: string) => string;

          constructor(baseUrl?: string, instance?: AxiosInstance, transformUrl?: (url: string) => string) {
              this.instance = instance || axios.create();
              this.baseUrl = baseUrl ?? "";
              this.transformUrl = transformUrl || ((u) => u);
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
      ): ${getMethodReturnType(method.returnType)} {
          let url_ = this.baseUrl + "${method.url}";
           url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, params)" : 'url_.replace(/[?&]$/, "")'};

           url_ = this.transformUrl(url_); 
           
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
    paramType = paramType.replace(target, replacement);
  }
  return paramType;
}

function getMethodReturnType(returnType: string) {
  console.log("before", returnType);
  for (const [target, replacement] of replacementMethodReturnType) {
    returnType = returnType.replace(target, replacement);
  }
  console.log("after", returnType);
  return returnType;
}

export function interfaceStructure(interfaceInfo: InterfaceDetails) {
  return `export interface ${interfaceInfo.interfaceName} {
        ${interfaceInfo.attributes
          .map((attribute) => {
            return `${attribute.isReadonly ? "readonly" : ""}
              ${attribute.name}${checkIfNullable(attribute.type)}:
              ${replacementInterfacePropertyType.reduce(
                (type, [pattern, to]) => type.replace(pattern, to),
                attribute.type
              )}`;
          })
          .join(";")}
    }`;
}
