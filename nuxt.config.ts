import { execSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

function getGitVersion() {
  try {
    return execSync("git describe --tags --always --dirty", {
      cwd: currentDir,
      encoding: "utf8",
    }).trim();
  } catch {
    return "dev";
  }
}

const appVersion = getGitVersion();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  ssr: false,
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      appVersion,
    },
  },
});
