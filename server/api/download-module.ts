import { mkdir, open } from "node:fs/promises";
import path from "path";
import { existsSync } from "node:fs";
import * as fs from "fs";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    console.log("query", query);

    if (query.module) {
      const module = query.module as string;
      const outputPath = await downloadModule(module);

      console.log("after downloaded ===>", outputPath);

      const fileContent = fs.readFileSync(
        outputPath + "/" + module + "Client.ts",
        "utf8"
      );

      return {
        success: true,
        message: "Downloaded File successfully",
        fileContent: fileContent,
      };
    }

    return {
      success: false,
      message: "Downloaded File Failed",
    };
  } catch (error) {
    console.error("Error Downloaded File:", error);
    return {
      success: false,
      message: "Error Downloaded File",
      error: error,
    };
  }
});

async function downloadModule(module: string) {
  try {
    const outputPath = path.join("/tmp", "downloads"); // Use /tmp for serverless environments

    const filePath = path.join(outputPath, `${module}Client.ts`);

    // Ensure the directory exists
    if (!existsSync(outputPath)) {
      await mkdir(outputPath, { recursive: true });
    }

    const response = await fetch(
      `https://dev.sahabsoft.com/api/Common/ClientCode/GetFile?module=${module}`
    );

    if (!response.ok) {
      throw new Error(`Failed to download module: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileContent = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer

    // Open the file in write mode ('w' flag clears the file before writing)
    const fileHandle = await open(filePath, "w");
    await fileHandle.write(fileContent);
    await fileHandle.close();

    console.log(
      `Successfully downloaded ${module} module to downloads/${module}Client.ts`
    );
    return outputPath;
  } catch (error) {
    console.error("Error downloading module:", error);
    throw error;
  }
}
