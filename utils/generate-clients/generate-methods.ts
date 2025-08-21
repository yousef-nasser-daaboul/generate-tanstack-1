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
  return methods
    .filter((method) => !exceptMethods.includes(method.name))
    .map((method) => {
      return apiStructure(method, className);
    })
    .join("\n");
}

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
