import { paramInterfaceStructure } from "~/client-config";
import type { MethodDetails } from "../ast/extract-metadata";
import { isApiMutate } from "../helper/helper";

export function generateParamsInterfaces(
  methods: MethodDetails[],
  className: string
) {
  return methods
    .map((method) => {
      if (method.params.length === 0) return ``;
      else if (
        method.httpMethod === "GET" ||
        (method.httpMethod === "DELETE" && !isApiMutate(method))
      ) {
        return paramInterfaceStructure(method, className);
        // return `
        //     export interface I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Params {
        //         ${method.params
        //           .filter(
        //             (param) =>
        //               ![
        //                 "branchIdHeader",
        //                 "signal",
        //                 "x_Idempotence_Key",
        //               ].includes(param.paramName)
        //           )
        //           .map(
        //             (param) =>
        //               `${param.paramName}${checkIfParamNullable(param.paramType)}: ${param.paramType.replace("| undefined", "")}`
        //           )
        //           .join(", ")}
        //     }
        // `;
      } else if (
        !method.params.some((param) => param.paramName === "body") &&
        !method.params.some((param) => param.paramName === "dto")
      ) {
        return paramInterfaceStructure(method, className);
        // return `
        //     export interface I${className.replace("Client", "")}${getFirstLetterUpperCase(method.name)}Dto {
        //         ${method.params
        //           .filter(
        //             (param) =>
        //               ![
        //                 "branchIdHeader",
        //                 "signal",
        //                 "x_Idempotence_Key",
        //               ].includes(param.paramName)
        //           )
        //           .map(
        //             (param) =>
        //               `${param.paramName}${checkIfParamNullable(param.paramType)}: ${param.paramType.replace("| undefined", "")}`
        //           )
        //           .join(", ")}
        //     }
        // `;
      }
    })
    .join("\n");
}

// function checkIfParamNullable(paramType: string) {
//   return paramType.includes("undefined") ? "?" : "";
// }
