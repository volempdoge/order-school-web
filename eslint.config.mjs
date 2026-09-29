import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "public/**",
    ".lighthouseci/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),

  // Next.js rules: React, hooks, accessibility (jsx-a11y), Core Web Vitals, TypeScript
  ...nextVitals,
  ...nextTs,

  {
    // eslint-plugin-react can't auto-detect the version under ESLint 10 (it uses a removed API)
    settings: { react: { version: "19.3" } },
  },

  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-explicit-any": "error",

      eqeqeq: ["error", "smart"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",

      // Accessibility: stricter than the Next.js defaults
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/no-autofocus": "error",
      "jsx-a11y/label-has-associated-control": ["error", { assert: "either", depth: 3 }],
      "jsx-a11y/no-noninteractive-element-interactions": "error",
      "jsx-a11y/click-events-have-key-events": "error",

      // Design system: colors come from tokens in globals.css (bg-primary, text-foreground…)
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]|oklch\\(/]",
          message: "Use a design token (bg-primary, text-foreground, …) instead of a raw color.",
        },
        {
          selector: "TemplateElement[value.raw=/\\[#[0-9a-fA-F]{3,8}\\]|oklch\\(/]",
          message: "Use a design token (bg-primary, text-foreground, …) instead of a raw color.",
        },
      ],

      "react/jsx-no-target-blank": "error",
      "react/self-closing-comp": "error",
    },
  },

  {
    // Playwright fixtures receive a `use` callback that is not a React hook
    files: ["e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },

  // Must be last: turns off stylistic rules that conflict with Prettier
  prettier,
]);

export default eslintConfig;
