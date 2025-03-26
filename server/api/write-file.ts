import { writeFormattedFile } from "../utils/helper/writer";
import fs from "fs";
import archiver from "archiver";
import { rimraf } from "rimraf";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (body.module && body.outputPath && body.content) {
      await writeFormattedFile(
        body.outputPath,
        `${body.module.toLowerCase()}.client.ts`,
        body.content
      );

      //   Archive Folder
      const archivePath = "public/generated.zip";
      await archiveResult(archivePath, body.outputPath);

      return {
        success: true,
        message: "Write File successfully",
        archivePath: archivePath,
      };
    }

    return {
      success: false,
      message: "Write File Failed",
    };
  } catch (error) {
    console.error("Error Write File:", error);
    return {
      success: false,
      message: "Error Write File",
      error: error,
    };
  }
});

async function archiveResult(archivePath: string, outputPath: string) {
  console.log("archivePath ===>", archivePath);
  console.log("outputPath ===>", outputPath);

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(
        `Archive created: ${archivePath} (${archive.pointer()} bytes)`
      );
      resolve();
    });

    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(outputPath, false);

    archive.finalize().catch(reject);
  }).then(() => rimraf(outputPath));
}
