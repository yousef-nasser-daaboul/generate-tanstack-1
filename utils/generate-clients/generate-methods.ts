import {
  apiStructure,
  exceptedParameters,
  exceptMethods,
  mutateParamsDtoNames,
} from "~/client-config";
import {
  MethodType,
  type MethodDetails,
  type ParamDetails,
} from "../ast/extract-metadata";
import { getFirstLetterUpperCase } from "../helper/helper";

export function generateMethods(methods: MethodDetails[], className: string) {
  //  !method.name.startsWith("process")
  return methods
    .filter((method) => !exceptMethods.includes(method.name))
    .map((method) => {
      return apiStructure(method, className);
      // if (method.httpMethod === "GET") {
      //   return apiStructure(method, className);
      // return `
      //     ${method.name}(
      //         ${generateQueryParams(method, className)}
      //         ${generateQueryParams(method, className) ? "," : ""}
      //         headers?:Record<string,string>
      //     ): ${method.returnType} {
      //         let url_ = this.baseUrl + "${method.url}";
      //         url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, params)" : 'url_.replace(/[?&]$/, "")'};

      //         const options_: AxiosRequestConfig = {
      //             method: "${method.httpMethod}",
      //             url: url_,
      //             headers: {
      //               ${generateHeaders(method)}${!!generateHeaders(method) ? "," : ""}
      //               ...headers,
      //             },
      //         };

      //         return this.instance.request(options_).then(process);
      //     }
      // `;
      // } else if (method.httpMethod === "DELETE") {
      //   return apiStructure(method, className);

      // const isMethodHasBodyOrParams = !!(isMethodMutate(method)
      //   ? generateMutateParams(method, className)
      //   : generateQueryParams(method, className));
      // return `
      //     ${method.name}(
      //         ${isMethodMutate(method) ? generateMutateParams(method, className) : generateQueryParams(method, className)}
      //         ${isMethodHasBodyOrParams ? "," : ""}
      //         headers?:Record<string,string>
      //     ): ${method.returnType} {
      //         let url_ = this.baseUrl + "${method.url}";
      //         url_ = ${method.methodType === MethodType.AddQueryParam ? "addQueryParamsToUrl(url_, params)" : 'url_.replace(/[?&]$/, "")'};

      //         ${
      //           isMethodMutate(method) && isMethodHasBodyOrParams
      //             ? `const content_ = ${method.methodType === MethodType.FormData ? "objectToFormData" : "JSON.stringify"}(body);`
      //             : ""
      //         }

      //         const options_: AxiosRequestConfig = {
      //             ${isMethodMutate(method) && isMethodHasBodyOrParams ? `data: content_,` : ""}
      //             method: "${method.httpMethod}",
      //             url: url_,
      //             headers: {
      //               ${generateHeaders(method)}${generateHeaders(method) ? "," : ""}
      //               ...headers,
      //             },
      //         };

      //         return this.instance.request(options_).then(process);
      //     }
      // `;
      // } else {
      //   return apiStructure(method, className);
      // const isMethodHasBody = !!generateMutateParams(method, className);
      // return `
      //     ${method.name}(
      //         ${generateMutateParams(method, className)}${isMethodHasBody ? "," : ""}
      //         headers?:Record<string,string>
      //     ): ${method.returnType} {
      //         let url_ = this.baseUrl + "${method.url}";
      //         url_ = url_.replace(/[?&]$/, "");

      //         ${isMethodHasBody ? `const content_ = ${method.methodType === MethodType.FormData ? "objectToFormData" : "JSON.stringify"}(body);` : ""}

      //         const options_: AxiosRequestConfig = {
      //             ${isMethodHasBody ? "data: content_," : ""}
      //             method: "${method.httpMethod}",
      //             url: url_,
      //             headers: {
      //               ${generateHeaders(method)}${generateHeaders(method) ? "," : ""}
      //               ...headers,
      //             },

      //         };

      //         return this.instance.request(options_).then(process);
      //     }
      // `;
      // }
    })
    .join("\n");
}

// export function isMethodMutate(method: MethodDetails) {
//   return !method.url.endsWith("?");
// }

export function generateHeaders(method: MethodDetails) {
  return method.headers
    .map((header) => `"${header.key}":"${header.value}"`)
    .join(",");
}
export function checkIfAllParamsNullable(params: ParamDetails[]) {
  return params
    ?.filter((param) => !exceptedParameters.includes(param.paramName))
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
  const paramMutateName = method.params?.find((param) =>
    mutateParamsDtoNames.includes(param.paramName)
  );
  if (method.params.length === 0) {
    return "";
  } else if (paramMutateName) {
    content += `body${
      method.methodType === MethodType.FormData
        ? ""
        : checkIfParamNullable(paramMutateName?.paramType ?? "")
    }: ${paramMutateName?.paramType?.replace("| undefined", "")}`;
  } else {
    content += `body${
      method.methodType === MethodType.FormData
        ? ""
        : checkIfAllParamsNullable(method.params)
    }: I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Dto`;
  }
  return content;
}
