import { interfaceStructure, skipInterfaces } from "~/client-config";
import type { InterfaceDetails } from "../ast/extract-metadata";

export function generateInterfaces(interfaces: InterfaceDetails[]) {
  let content = "";

  interfaces.map((interfaceInfo) => {
    const shouldSkip = skipInterfaces.some((pattern) =>
      pattern.test(interfaceInfo.interfaceName)
    );

    if (shouldSkip) {
      return;
    }

    let interfaceContent = interfaceStructure(interfaceInfo);
    content += interfaceContent;
  });
  return content;
}
