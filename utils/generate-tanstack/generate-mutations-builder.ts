import {
  HttpMethod,
  type ClassDetails,
  type MethodDetails,
  type ParamDetails,
} from "../ast/extract-metadata";
import { generateMutateParams } from "../generate-clients/generate-methods";
import { getFirstLetterUpperCase } from "../helper/helper";
import {
  generateClassQueryKeyName,
  generateMethodQueryKeyName,
} from "./generate-query-keys";

export function generateMutateQueries(
  astObj: ClassDetails[],
  clientName: string,
  exceptedTypes: string[],
  replacementTypes: [string, string][]
) {
  // Generate Imports
  let content = `import { useMutationBuilder } from "~base/composables/useMutationBuilder"; import {`;

  // Generate Clients
  if (astObj.length > 0) {
    content += astObj.map((obj) => generateClientObj(obj.className)).join(",");
    // content += `} from "~mig/utils/${clientName.replace(".", "/")}";`;
    content += `} from ".";`;
  }

  if (astObj.length > 0) {
    content += generateMutationsImports(
      astObj,
      clientName,
      exceptedTypes,
      replacementTypes
    );

    // Generate Query Keys
    const queryKeysName = `${clientName.split(".")[0].toUpperCase()}_QUERY_KEYS`;
    // content += `import {${queryKeysName}} from "~mig/utils/${clientName.replace(".", "/")}/${clientName.split(".")[0]}-query-keys";\n\n`;
    content += `import {${queryKeysName}} from "./${clientName.split(".")[0]}-query-keys";\n\n`;

    // Generate Mutate Queries
    content += astObj
      .map((classDetail) => {
        return classDetail.methods
          .filter((method) => method.httpMethod !== HttpMethod.GET)
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            const methodName =
              method.name.charAt(0).toUpperCase() + method.name.slice(1);
            const clientNameUpdated = clientName.split(".")[0].toUpperCase();

            return `export const use${methodName}${className} = () => 
             useMutationBuilder({
              prefix:"${method.name}${className}",
              mutationOptions: {
                mutationFn:(${generateMQueryFunctionParams(method, methodName, className)})
                    =>${generateClientObj(classDetail.className)}.${method.name}(${generateMQueryFnAssignParams(method.params)}),
              },
              keysToInvalidate:${generateMQueryPaths(classDetail, classDetail.methods, clientNameUpdated)},
            });
          `;
          })
          .join("\n");
      })
      .join("\n");
  }

  return content;
}

export function generateMQueryPaths(
  classDetail: ClassDetails,
  methods: MethodDetails[],
  clientNameUpdated: string
) {
  const listMethods = methods.filter(
    (method) =>
      method.name.toLowerCase().includes("list") &&
      method.httpMethod === HttpMethod.GET
  );

  if (listMethods.length === 0) {
    return `[]`;
  }

  return `[${listMethods.map((method) => `${clientNameUpdated}_QUERY_KEYS.${generateClassQueryKeyName(classDetail)}.${generateMethodQueryKeyName(method)}`).join(",")}]`;
}

function generateMQueryFunctionParams(
  method: MethodDetails,
  methodName: string,
  className: string
) {
  if (method.params.length === 1) {
    return `${method.params[0].paramName}:${method.params[0].paramType}`;
  }
  return generateMutateParams(
    method.params,
    methodName,
    className,
    method.methodType
  );
}

function generateMQueryFnAssignParams(params: ParamDetails[]) {
  if (params.length === 1) {
    return params[0].paramName !== "body" ? `{${params[0].paramName}}` : `body`;
  }
  return `body`;
}

export function generateClientObj(className: string) {
  return className.charAt(0).toLowerCase() + className.slice(1);
}

function generateMutationsImports(
  astObj: ClassDetails[],
  clientName: string,
  exceptedTypes: string[],
  replacementTypes: [string, string][]
) {
  let content = "";
  // Start building a unique type set
  const allTypes = new Set<string>();

  // 👉 Collect Param Types
  astObj.forEach((classDetail) => {
    classDetail.methods
      .filter((method) => method.httpMethod !== HttpMethod.GET)
      .forEach((method) => {
        method.params
          .filter(
            (param) =>
              param.paramType && !exceptedTypes.includes(param.paramType)
          )
          .forEach((param) => {
            const cleanedType = replacementTypes.reduce(
              (type, [from, to]) => type.replaceAll(from, to),
              param.paramType
            );
            allTypes.add(cleanedType);
          });
      });
  });

  // 👉 Collect Body Types
  astObj.forEach((classDetail) => {
    classDetail.methods
      .filter((method) => method.httpMethod !== HttpMethod.GET)
      .forEach((method) => {
        const className = classDetail.className.replace("Client", "");
        const methodName =
          method.name.charAt(0).toUpperCase() + method.name.slice(1);

        const bodyParam = method.params.find(
          (param) => param.paramName === "body"
        );

        if (bodyParam) {
          const cleanedType = replacementTypes.reduce(
            (type, [from, to]) => type.replaceAll(from, to),
            bodyParam.paramType
          );
          allTypes.add(cleanedType);
        } else {
          allTypes.add(
            `I${className}${getFirstLetterUpperCase(methodName)}Dto`
          );
        }
      });
  });

  // ✅ Build one import statement
  content += "import type { ";
  content += Array.from(allTypes).join(", ");
  content += ` } from "../${clientName.replace(".", "/")}.client";`;

  return content;
}
