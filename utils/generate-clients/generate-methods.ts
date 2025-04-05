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
      if (method.httpMethod === "GET" || method.httpMethod === "DELETE") {
        return `
            ${method.name}(
                body${checkIfAllParamsNullable(method.params)}: I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Params
            ): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, body)" : 'url_.replace(/[?&]$/, "")'};

                let options_: AxiosRequestConfig = {
                    method: "${method.httpMethod}",
                    url: url_,
                    headers: {
                      ${generateHeaders(method)}
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      } else {
        return `
            ${method.name}(${generateMutateParams(
              method.params,
              method.name,
              className,
              method.methodType
            )}): ${method.returnType} {
                let url_ = this.baseUrl + "${method.url}";
                url_ = url_.replace(/[?&]$/, "");

                const content_ = ${method.methodType === MethodType.FormData ? "objectToFormData" : "JSON.stringify"}(body);

                let options_: AxiosRequestConfig = {
                    data: content_,
                    method: "${method.httpMethod}",
                    url: url_,
                    headers: {
                      ${generateHeaders(method)}
                    },
                };

                return this.instance.request(options_).then(process);
            }
        `;
      }
    })
    .join("\n");
}

function generateHeaders(method: MethodDetails) {
  return method.headers
    .map((header) => `"${header.key}":"${header.value}"`)
    .join(",");
}
function checkIfAllParamsNullable(params: ParamDetails[]) {
  return params
    .filter((param) => !["branchIdHeader", "signal"].includes(param.paramName))
    .every((param) => param.paramType.includes("undefined"))
    ? "?"
    : "";
}

function checkIfParamNullable(paramType: string) {
  return paramType.includes("undefined") ? "?" : "";
}

function generateMutateParams(
  params: ParamDetails[],
  methodName: string,
  className: string,
  methodType: MethodType
) {
  let content = "";
  if (params.find((param) => param.paramName === "body")) {
    content += `body${
      methodType === MethodType.FormData
        ? ""
        : checkIfParamNullable(
            params.find((param) => param.paramName === "body")?.paramType ?? ""
          )
    }: ${params
      .find((param) => param.paramName === "body")
      ?.paramType?.replace("| undefined", "")}
          `;
  } else {
    content += `body${
      methodType === MethodType.FormData ? "" : checkIfAllParamsNullable(params)
    }: I${className.replace("Client", "")}${getFirstLetterUpperCase(methodName)}Dto`;
  }
  return content;
}
