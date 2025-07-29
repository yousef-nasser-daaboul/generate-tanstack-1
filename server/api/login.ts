import { createHash } from "crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (body.password === "fikratech") {
    // Very simple "token" from the secret
    const token = createHash("sha256").update(body.password).digest("hex");
    return { success: true, token, module: body.password };
  } else {
    return { success: false, message: "Invalid password" };
  }
});
