/**
 * Shared ESLint configuration for FoundryVTT modules
 * 
 * Usage in module .eslintrc.json:
 * {
 *   "extends": ["@rayners/foundry-dev-tools/configs/eslint"]
 * }
 * 
 * Or in eslint.config.js:
 * import foundryConfig from '@rayners/foundry-dev-tools/configs/eslint.config.js';
 * export default foundryConfig;
 */

export default {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: 2022,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  rules: {
    // TypeScript-specific rules
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    
    // JavaScript rules
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn"
  },
  env: {
    browser: true,
    es2022: true,
    jquery: true,
    node: true
  },
  globals: {
    // Core Foundry globals
    "game": "readonly",
    "canvas": "readonly", 
    "ui": "readonly",
    "Hooks": "readonly",
    "CONFIG": "readonly",
    "foundry": "readonly",
    
    // Template functions
    "renderTemplate": "readonly",
    "loadTemplates": "readonly",
    
    // Application classes
    "Dialog": "readonly",
    "Application": "readonly",
    "FormApplication": "readonly",
    "DocumentSheet": "readonly",
    "ActorSheet": "readonly",
    "ItemSheet": "readonly",
    
    // Document classes
    "JournalEntry": "readonly",
    "User": "readonly",
    "Folder": "readonly",
    "Actor": "readonly",
    "Item": "readonly",
    "Scene": "readonly",
    "Playlist": "readonly",
    "Macro": "readonly",
    
    // Additional common globals
    "CONST": "readonly",
    "duplicate": "readonly",
    "mergeObject": "readonly",
    "setProperty": "readonly",
    "getProperty": "readonly",
    "hasProperty": "readonly",
    "expandObject": "readonly",
    "flattenObject": "readonly",
    "isObjectEmpty": "readonly"
  },
  ignorePatterns: [
    "dist/",
    "node_modules/", 
    "coverage/",
    "*.js",
    "*.mjs"
  ]
};