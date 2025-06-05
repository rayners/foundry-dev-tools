/**
 * @rayners/foundry-dev-tools
 * 
 * Shared development tools and configurations for FoundryVTT modules
 */

// Rollup configurations
export { 
  createFoundryConfig, 
  createFoundryConfigWithDir 
} from './rollup/foundry-config.js';

// Test configurations  
export { createFoundryTestConfig } from './configs/vitest.config.js';

// Re-export config files for direct import
export { default as eslintConfig } from './configs/eslint.config.js';
export { default as prettierConfig } from './configs/prettier.config.js';
export { default as vitestConfig } from './configs/vitest.config.js';