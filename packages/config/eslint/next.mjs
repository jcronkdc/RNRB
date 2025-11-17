import nextPlugin from "@next/eslint-plugin-next";
import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    name: "songforge/next",
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules
    }
  }
];

