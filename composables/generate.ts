import { generateFolderNameWithDateNow } from "~/utils/helper/generate-folder-name";
import { generateClient } from "~/utils/generate-clients/generate-clients";

export function generate(fileContent: string) {
  return generateClient(fileContent);
}
