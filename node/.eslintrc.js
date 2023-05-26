module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    ["no-unused-vars"]: [
      "error",
      {
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    ["no-console"]: [
      "error",
      {
        allow: ["info", "warn", "error"],
      },
    ],
  },
};
