import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    app: "ff-dl-stream.ts"
  },
  shims: true,
  tsconfig: "./tsconfig.json",
  outDir: "ff-dl-stream",
  deps: {
    neverBundle: ["ws"],
    alwaysBundle: [/^@x(?:\/.*)?$/]
  }
});
