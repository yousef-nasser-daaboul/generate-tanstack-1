import { createHash } from "crypto";

export default defineEventHandler(async (event) => {
  // Get the token from the Authorization header
  const headers = getRequestHeaders(event);
  const authorization = headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return { success: false, message: "No token provided" };
  }

  const token = authorization.split(" ")[1];

  const secret = "sahab";
  const expectedToken = createHash("sha256").update(secret).digest("hex");

  // Check if the provided token matches the expected token
  if (token === expectedToken) {
    return { success: true, message: "Token is valid" };
  } else {
    return { success: false, message: "Invalid token" };
  }
});
