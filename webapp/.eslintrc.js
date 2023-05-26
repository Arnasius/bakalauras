module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    es6: true,
    node: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true
    }
  },
  plugins: ["react"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    ["no-unused-vars"]: [
      "error",
      {
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true
      }
    ],
    ["react/prop-types"]: 0,
    ["no-console"]: [
      "error",
      {
        allow: [
          "info",
          "warn",
          "error"
        ]
      }
    ]
  }
};
