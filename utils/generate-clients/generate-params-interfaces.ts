import { exceptedParameters, paramInterfaceStructure } from "~/client-config";
import type { MethodDetails } from "../ast/extract-metadata";
import { isApiMutate } from "../helper/helper";

export function generateParamsInterfaces(
  methods: MethodDetails[],
  className: string
) {
  return methods
    .filter(
      (method) =>
        !method.params.every((param) =>
          exceptedParameters.includes(param.paramName)
        )
    )
    .map((method) => {
      console.log(method.params);
      if (method.params.length === 0) return ``;
      else if (
        method.httpMethod === "GET" ||
        (method.httpMethod === "DELETE" && !isApiMutate(method))
      ) {
        return paramInterfaceStructure(method, className);
      } else if (
        !method.params.some((param) => param.paramName === "body") &&
        !method.params.some((param) => param.paramName === "dto")
      ) {
        return paramInterfaceStructure(method, className);
      }
    })
    .join("\n");
}
