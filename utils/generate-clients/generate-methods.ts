import {
  MethodType,
  type MethodDetails,
  type ParamDetails,
} from "../ast/extract-metadata";
import { getFirstLetterUpperCase } from "../helper/helper";

export function generateMethods(methods: MethodDetails[], className: string) {
  return methods
    .filter((method) => !method.name.startsWith("process"))
    .map((method) => {
      if (method.httpMethod === "GET") {
        return `
            ${method.name}(
                ${generateQueryParams(method, className)}
                ${generateQueryParams(method, className) ? "," : ""}
                headers?:Record<string,string>
            ): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, params)" : 'url_.replace(/[?&]$/, "")'};

                const options_: AxiosRequestConfig = {
                    method: "${method.httpMethod}",
                    url: url_,
                    headers: {
                      ${generateHeaders(method)}${!!generateHeaders(method) ? "," : ""}
                      ...headers,
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      } else if (method.httpMethod === "DELETE") {
        const isMethodHasBodyOrParams = !!(isMethodMutate(method)
          ? generateMutateParams(method, className)
          : generateQueryParams(method, className));
        return `
            ${method.name}(
                ${isMethodMutate(method) ? generateMutateParams(method, className) : generateQueryParams(method, className)}
                ${isMethodHasBodyOrParams ? "," : ""}
                headers?:Record<string,string>
            ): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, params)" : 'url_.replace(/[?&]$/, "")'};

                ${
                  isMethodMutate(method) && isMethodHasBodyOrParams
                    ? `const content_ = ${method.methodType === MethodType.FormData ? "objectToFormData" : "JSON.stringify"}(body);`
                    : ""
                }

                const options_: AxiosRequestConfig = {
                    ${isMethodMutate(method) && isMethodHasBodyOrParams ? `data: content_,` : ""}
                    method: "${method.httpMethod}",
                    url: url_,
                    headers: {
                      ${generateHeaders(method)}${generateHeaders(method) ? "," : ""}
                      ...headers,
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      } else {
        const isMethodHasBody = !!generateMutateParams(method, className);
        return `
            ${method.name}(
                ${generateMutateParams(method, className)}${isMethodHasBody ? "," : ""}
                headers?:Record<string,string>
            ): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = url_.replace(/[?&]$/, "");

                ${isMethodHasBody ? `const content_ = ${method.methodType === MethodType.FormData ? "objectToFormData" : "JSON.stringify"}(body);` : ""}
                
                const options_: AxiosRequestConfig = {
                    ${isMethodHasBody ? "data: content_," : ""}
                    method: "${method.httpMethod}",
                    url: url_,
                    headers: {
                      ${generateHeaders(method)}${generateHeaders(method) ? "," : ""}
                      ...headers,
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      }
    })
    .join("\n");
}

export function isMethodMutate(method: MethodDetails) {
  return !method.url.endsWith("?");
}

function generateHeaders(method: MethodDetails) {
  return method.headers
    .map((header) => `"${header.key}":"${header.value}"`)
    .join(",");
}
export function checkIfAllParamsNullable(params: ParamDetails[]) {
  return params
    ?.filter(
      (param) =>
        !["branchIdHeader", "signal", "x_Idempotence_Key"].includes(
          param.paramName
        )
    )
    .every((param) => param.paramType.includes("undefined"))
    ? "?"
    : "";
}

function checkIfParamNullable(paramType: string) {
  return paramType.includes("undefined") ? "?" : "";
}

export function generateQueryParams(method: MethodDetails, className: string) {
  if (method.params.length === 0) return ``;
  else
    return `params${checkIfAllParamsNullable(method.params)}: I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Params`;
}

export function generateMutateParams(method: MethodDetails, className: string) {
  let content = "";
  if (method.params.length === 0) {
    return "";
  } else if (method.params?.find((param) => param.paramName === "body")) {
    content += `body${
      method.methodType === MethodType.FormData
        ? ""
        : checkIfParamNullable(
            method.params.find((param) => param.paramName === "body")
              ?.paramType ?? ""
          )
    }: ${method.params
      .find((param) => param.paramName === "body")
      ?.paramType?.replace("| undefined", "")}
          `;
  } else if (method.params?.find((param) => param.paramName === "dto")) {
    content += `body${
      method.methodType === MethodType.FormData
        ? ""
        : checkIfParamNullable(
            method.params.find((param) => param.paramName === "dto")
              ?.paramType ?? ""
          )
    }: ${method.params
      .find((param) => param.paramName === "dto")
      ?.paramType?.replace("| undefined", "")}
          `;
  } else {
    content += `body${
      method.methodType === MethodType.FormData
        ? ""
        : checkIfAllParamsNullable(method.params)
    }: I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Dto`;
  }
  return content;
}
