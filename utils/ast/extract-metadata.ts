export interface ParamDetails {
  paramName: string;
  paramType: string;
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  UNKNOWN = "UNKNOWN",
}

export enum MethodType {
  FormData,
  Json,
  Replace,
  AddQueryParam,
}

export interface Header {
  key: string;
  value: string;
}

export interface MethodDetails {
  name: string;
  params: ParamDetails[];
  returnType: string;
  httpMethod: HttpMethod;
  url: string;
  methodType: MethodType;
  headers: Header[];
}

export interface ClassDetails {
  className: string;
  methods: MethodDetails[];
}

export interface InterfaceDetails {
  interfaceName: string;
  code: string;
  attributes: AttributeDetails[];
}

export interface AttributeDetails {
  name: string;
  type: string;
  isReadonly: boolean;
}

export interface EnumDetails {
  name: string;
  code: string;
  values: string[];
}

export function extractClassDetails(
  fileContent: string,
  except?: string[]
): ClassDetails[] {
  const ts = (window as any).ts;
  const sourceFile = ts.createSourceFile(
    "source.ts",
    fileContent,
    ts.ScriptTarget.Latest
  );

  const classes: ClassDetails[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      const className = node.name?.text || "";

      // Skip if class is in except array
      if (except?.includes(className)) return;

      // console.log(`Found class: ${className}`);

      const methods: MethodDetails[] = [];

      // Extracting methods
      ts.forEachChild(node, (classNode) => {
        if (ts.isMethodDeclaration(classNode)) {
          const methodName = classNode.name.getText(sourceFile);

          const params =
            classNode.parameters?.map((param) => ({
              paramName: param.name.getText(sourceFile),
              paramType: param.type?.getText(sourceFile) ?? "unknown",
            })) ?? [];

          const returnType = classNode.type?.getText(sourceFile) ?? "void";

          // Extract method HTTP verb (GET, POST, etc.)
          let httpMethod = HttpMethod.UNKNOWN;
          const bodyText = classNode.body?.getFullText(sourceFile) ?? "";

          const methodMatch = bodyText.match(
            /method:\s*["'](GET|POST|PUT|DELETE|PATCH)["']/i
          );
          if (methodMatch) {
            httpMethod = methodMatch[1].toUpperCase() as HttpMethod;
          }

          // Extract URL
          let url = "";
          const urlMatch = bodyText.match(
            /let url_ = this\.baseUrl \+ "([^"]+)"/
          );
          if (urlMatch) {
            url = urlMatch[1];
          }

          // Detect MethodType
          const methodType = detectMethodType(classNode, httpMethod);

          // Extract Headers
          const headers = extractHeaders(classNode);
          // const headers = [] as Header[];
          // const optionsStatement = classNode.body.statements?.find(
          //   (statement) =>
          //     statement?.declarationList?.declarations?.[0]?.name?.text ===
          //     "options_"
          // );

          // const headersStatement =
          //   optionsStatement?.declarationList?.declarations?.[0]?.initializer?.properties?.find(
          //     (property) => property?.name?.text === "headers"
          //   );

          // console.log("headersStatement  ===>", headersStatement);

          methods.push({
            name: methodName,
            params,
            returnType,
            httpMethod,
            methodType,
            url,
            headers,
          });
        }
      });

      classes.push({ className, methods });
    }
  });

  return classes;
}

function extractHeaders(classNode: any) {
  const headers: Header[] = [];
  try {
    const optionsStatement = classNode.body?.statements?.find(
      (statement: any) =>
        statement?.declarationList?.declarations?.[0]?.name?.text === "options_"
    );

    const headersProperty =
      optionsStatement?.declarationList?.declarations?.[0]?.initializer?.properties?.find(
        (property: any) => property?.name?.text === "headers"
      );

    if (headersProperty?.initializer?.properties) {
      for (const prop of headersProperty.initializer.properties) {
        if (prop.initializer?.text) {
          headers.push({
            key: prop.name?.text,
            value: prop.initializer?.text,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Header extraction failed:", e);
  }
  return headers;
}

function detectMethodType(classNode: any, httpMethod: HttpMethod) {
  let methodType = MethodType.FormData;
  try {
    if (httpMethod === "GET" || httpMethod === "DELETE") {
      const secondStatement = classNode.body?.statements?.[1];
      if (secondStatement && "elseStatement" in secondStatement) {
        methodType = MethodType.AddQueryParam;
      } else if (
        secondStatement?.expression?.right?.expression?.name?.text === "replace"
      ) {
        methodType = MethodType.Replace;
      }
    } else {
      const contentStatement = classNode.body?.statements?.find(
        (statement: any) =>
          statement?.declarationList?.declarations?.[0]?.name?.text ===
          "content_"
      );
      const initializer =
        contentStatement?.declarationList?.declarations?.[0]?.initializer;

      if (initializer?.expression?.name?.text === "stringify") {
        methodType = MethodType.Json;
      }
    }
  } catch (e) {
    console.warn("Method type extraction failed:", e);
  }
  return methodType;

  // let methodType = MethodType.FormData;
  // try {
  //   if (httpMethod === "GET" || httpMethod === "DELETE") {
  //     if (!!classNode.body.statements?.[1]?.elseStatement) {
  //       methodType = MethodType.AddQueryParam;
  //     } else if (
  //       classNode.body.statements?.[1]?.expression?.right?.expression?.name
  //         ?.text === "replace"
  //     ) {
  //       methodType = MethodType.Replace;
  //     }
  //   } else {
  //     const contentStatement = classNode.body.statements?.find(
  //       (statement) =>
  //         statement?.declarationList?.declarations?.[0]?.name?.text ===
  //         "content_"
  //     );
  //     if (
  //       contentStatement?.declarationList?.declarations?.[0]?.initializer
  //         ?.expression?.name?.text === "stringify"
  //     ) {
  //       methodType = MethodType.Json;
  //     }
  //   }
  // } catch (e) {}
}

export function extractInterfaceDetails(
  fileContent: string
): InterfaceDetails[] {
  const ts = (window as any).ts;
  const sourceFile = ts.createSourceFile(
    "source.ts",
    fileContent,
    ts.ScriptTarget.Latest
  );

  const interfaces: InterfaceDetails[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      const interfaceName = node.name?.text || "";
      const attributes: AttributeDetails[] = [];

      ts.forEachChild(node, (interfaceNode) => {
        if (ts.isPropertySignature(interfaceNode)) {
          const attributeName = interfaceNode.name.getText(sourceFile);
          const attributeType =
            interfaceNode.type?.getText(sourceFile) || "unknown";
          attributes.push({
            name: attributeName,
            type: attributeType,
            isReadonly:
              interfaceNode.modifiers?.some(
                (modifier) => modifier.kind === ts.SyntaxKind.ReadonlyKeyword
              ) || false,
          });
        }
      });

      interfaces.push({
        interfaceName,
        attributes,
        code: node.getFullText(sourceFile),
      });
    }
  });

  return interfaces;
}

export function extractEnumDetails(fileContent: string): EnumDetails[] {
  const ts = (window as any).ts;
  const sourceFile = ts.createSourceFile(
    "source.ts",
    fileContent,
    ts.ScriptTarget.Latest
  );

  const enums: EnumDetails[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isEnumDeclaration(node)) {
      const enumName = node.name?.text || "";
      const enumValues = node.members.map((member) =>
        member.name.getText(sourceFile)
      );

      enums.push({
        name: enumName,
        values: enumValues,
        code: node.getFullText(sourceFile),
      });
    }
  });

  return enums;
}
