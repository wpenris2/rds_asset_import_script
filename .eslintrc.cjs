module.exports = {
  env: { node: true, es2022: true, jest: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  rules: {
    "import/order": ["warn", { "newlines-between": "always" }],
    "@typescript-eslint/explicit-function-return-type": "off"
  }
};
