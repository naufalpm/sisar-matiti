import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": import.meta.dirname,
      "server-only": `${import.meta.dirname}/tests/stub-server-only.ts`,
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgres://sisar:sisar@localhost:5433/sisar_test",
    },
    fileParallelism: false,
  },
});
