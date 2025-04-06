import { createHash } from "crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const secret = "sahab";

  if (body.password === secret) {
    // Very simple "token" from the secret
    const token = createHash("sha256").update(secret).digest("hex");
    return { success: true, token };
  } else {
    return { success: false, message: "Invalid password" };
  }
});
