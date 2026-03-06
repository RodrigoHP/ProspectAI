import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  {
    ignores: [
      ".aios-core/**",
      ".antigravity/**",
      ".codex/**",
      ".cursor/**",
      ".gemini/**",
      "node_modules/**",
      ".next/**",
    ],
  },
  {
    extends: [...next],
  },
]);
