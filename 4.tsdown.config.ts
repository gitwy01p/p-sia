import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    app: "scrape.ts"
  },
  shims: true,
  tsconfig: "./tsconfig.json",
  outDir: "scrape",
  deps: {
    neverBundle: ["ws"],
    alwaysBundle: [/^@x(?:\/.*)?$/]
  }
});
