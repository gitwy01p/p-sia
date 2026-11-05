import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    app: "ff-dl.ts"
  },
  shims: true,
  tsconfig: "./tsconfig.json",
  outDir: "ff-dl",
  deps: {
    neverBundle: ["ws"],
    alwaysBundle: [/^@x(?:\/.*)?$/]
  }
});
