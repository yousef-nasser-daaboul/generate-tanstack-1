import { HttpMethod, type MethodDetails } from "../ast/extract-metadata";

export function getFirstLetterUpperCase(str: string) {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
}

export function checkIfParamNullable(paramType: string) {
  return paramType.includes("undefined") ? "?" : "";
}

export function isApiMutate(method: MethodDetails) {
  return (
    !method.url.endsWith("?") ||
    method.httpMethod === HttpMethod.PUT ||
    method.httpMethod === HttpMethod.PATCH ||
    method.httpMethod === HttpMethod.POST
  );
}

export function checkIfNullable(type: string) {
  return type.includes("null") || type.includes("undefined") ? "?" : "";
}
