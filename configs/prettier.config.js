/**
 * Shared Prettier configuration for FoundryVTT modules
 * 
 * Usage in module prettier.config.js:
 * export { default } from '@rayners/foundry-dev-tools/configs/prettier.config.js';
 * 
 * Or in package.json:
 * "prettier": "@rayners/foundry-dev-tools/configs/prettier.config.js"
 */

export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  
  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve'
      }
    },
    {
      files: '*.{yaml,yml}',
      options: {
        tabWidth: 2,
        singleQuote: false
      }
    }
  ]
};