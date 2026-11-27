import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    app: "app.ts"
  },
  shims: true,
  tsconfig: "./tsconfig.json",
  outDir: "app",
  deps: {
    neverBundle: ["ws", "puppeteer", "puppeteer-extra"],
    alwaysBundle: [/^@x(?:\/.*)?$/]
  }
});
