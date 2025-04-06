import { HttpMethod, type ClassDetails } from "../ast/extract-metadata";

export function generateQueries(astObj: ClassDetails[], clientName: string) {
  let content = "";

  // Generate Types
  if (astObj.length > 0) {
    // Generate Queries
    content += astObj
      .map((classDetail) => {
        return classDetail.methods
          .filter((method) => method.httpMethod === HttpMethod.GET)
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            const methodName = method.name.replace("get", "");

            return `const {
              get${className}${methodName}Data,
              get${className}${methodName}Refetch,
              get${className}${methodName}IsLoading,
              get${className}${methodName}IsFetching
            } = useGet${className}${methodName}()();
            `;
          })
          .join("\n");
      })
      .join(
        `\n // ${clientName.split(".")[0].charAt(0).toUpperCase() + clientName.split(".")[0].slice(1)}\n`
      );
  }

  return content;
}
