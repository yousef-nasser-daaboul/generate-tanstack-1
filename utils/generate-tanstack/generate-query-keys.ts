import {
  HttpMethod,
  type ClassDetails,
  type MethodDetails,
} from "../ast/extract-metadata";

export function generateQueryKeys(astObj: ClassDetails[], clientName: string) {
  const clientNameUpdated = clientName.split(".")[0].toUpperCase();
  let content = `export const ${clientNameUpdated}_QUERY_KEYS = {`;
  astObj.forEach((classDetail) => {
    // Start object for this class
    content += `${generateClassQueryKeyName(classDetail)}: {`;

    // Add methods that are GET type
    classDetail.methods.forEach((method) => {
      if (method.httpMethod === HttpMethod.GET) {
        const clientNameUpdated = clientName.split(".")[0].toUpperCase();
        content += `${generateMethodQueryKeyName(method)}: '${clientNameUpdated}.${generateQueryPathValue(classDetail, method)}',`;
      }
    });

    content += "},";
  });

  content += "};";

  return content;
}

export function generateQueryPathValue(
  classDetail: ClassDetails,
  method: MethodDetails
) {
  return `${generateClassQueryKeyName(classDetail)}.${generateMethodQueryKeyName(method)}`;
}

export function generateClassQueryKeyName(classDetail: ClassDetails) {
  return classDetail.className
    .replace(/Client$/, "") // Remove 'Client' suffix
    .split(/(?=[A-Z])/) // Split on capital letters
    .join("_") // Join with underscores
    .toUpperCase(); // Convert to uppercase
}
export function generateMethodQueryKeyName(method: MethodDetails) {
  return method.name
    .split(/(?=[A-Z])/)
    .join("_")
    .toUpperCase();
}
