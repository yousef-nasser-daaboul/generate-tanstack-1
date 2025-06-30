import { createHash } from "crypto";
import { modules } from "./modules";

export default defineEventHandler(async (event) => {
  // Get the token from the Authorization header
  const headers = getRequestHeaders(event);
  const authorization = headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return { success: false, message: "No token provided" };
  }

  const token = authorization.split(" ")[1];

  const expectedTokens = modules.map((m) =>
    createHash("sha256").update(m).digest("hex")
  );

  const index = expectedTokens.indexOf(token);

  if (index !== -1) {
    return {
      success: true,
      message: "Token is valid",
      module: modules[index],
    };
  } else {
    return { success: false, message: "Invalid token" };
  }
});
