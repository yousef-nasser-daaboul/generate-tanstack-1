import { HttpMethod, type ClassDetails } from "../ast/extract-metadata";

export function generateMutations(astObj: ClassDetails[], clientName: string) {
  let content = "";

  // Generate Types
  if (astObj.length > 0) {
    // Generate Mutate Queries
    content += astObj
      .map((classDetail) => {
        return classDetail.methods
          .filter((method) => method.httpMethod !== HttpMethod.GET)
          .map((method) => {
            const className = classDetail.className.replace("Client", "");
            const methodName =
              method.name.charAt(0).toUpperCase() + method.name.slice(1);

            return `const {${method.name}${className}MutateAsync:${method.name}${className},${method.name}${className}IsPending:${methodName}${className}IsLoading} 
            = use${methodName}${className}()({
                onSuccess:()=>{}
              })
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
