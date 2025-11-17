import js from "@eslint/js";
import tseslint from "typescript-eslint";

const ignores = [
  "node_modules",
  "dist",
  "build",
  ".next",
  "storybook-static",
  "coverage"
];

export default tseslint.config(
  {
    name: "songforge/ignores",
    ignores
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    name: "songforge/base",
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        ecmaVersion: "latest"
      }
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message: "Use literal unions instead of enums."
        }
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  }
);

