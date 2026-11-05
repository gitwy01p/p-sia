import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    app: "ff-probe.ts"
  },
  shims: true,
  tsconfig: "./tsconfig.json",
  outDir: "ff-probe",
  deps: {
    neverBundle: ["ws"],
    alwaysBundle: [/^@x(?:\/.*)?$/]
  }
});
