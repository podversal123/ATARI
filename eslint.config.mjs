import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma client - not hand-written source.
    "lib/generated/**",
  ]),
  {
    rules: {
      // A leading underscore is the conventional "intentionally unused" marker
      // (e.g. `const { id: _id, ...rest } = row` to strip a field).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      // The Add/Edit forms start their "fetch this record by id" effect with a
      // synchronous setLoading(true) - the canonical load-a-resource pattern,
      // not the derived-state anti-pattern this rule is really aimed at. Keep
      // it visible as a warning rather than failing the build on it.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
