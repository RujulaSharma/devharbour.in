import tseslint from "typescript-eslint";
export default [
  { ignores: ["public/**", "generated/**", ".local/**", "node_modules/**"] },
  {
    files: ["frontend/homepage/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: { "no-debugger": "error" },
  },
];
