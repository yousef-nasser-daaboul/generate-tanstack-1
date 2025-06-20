import { interfaceStructure } from "~/client-config";
import type { InterfaceDetails } from "../ast/extract-metadata";

export function generateInterfaces(interfaces: InterfaceDetails[]) {
  let content = "";

  interfaces.map((interfaceInfo) => {
    let interfaceContent = interfaceStructure(interfaceInfo);
    content += interfaceContent;
  });
  return content;
}
