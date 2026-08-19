import { defineConfig } from "vitest/config";

export default defineConfig({
  // `tsconfig.json` keeps `jsx: "preserve"` because Next.js compiles JSX itself;
  // the test runner has to transform it instead.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    include: ["tests/**/*.test.tsx"],
  },
});
