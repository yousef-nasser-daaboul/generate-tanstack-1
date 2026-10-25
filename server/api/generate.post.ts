import { createHash } from "crypto";
import { runGenerateCli } from "../utils/run-generate-cli";

export default defineEventHandler(async (event) => {
  const headers = getRequestHeaders(event);
  const authorization = headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : undefined;
  const expectedToken = createHash("sha256").update("fikratech").digest("hex");

  if (token !== expectedToken) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }

  const body = await readBody(event);
  const { fileContent, module, withTanstack, withoutFormatting } = body ?? {};

  if (!fileContent || !module) {
    throw createError({
      statusCode: 400,
      statusMessage: "fileContent and module are required",
    });
  }

  return await runGenerateCli({
    fileContent,
    module,
    withTanstack: Boolean(withTanstack),
    withoutFormatting,
  });
});
