import { existsSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

/**
 * Shared Vitest configuration for FoundryVTT modules
 * 
 * Usage in module vitest.config.ts:
 * import { createFoundryTestConfig } from '@rayners/foundry-dev-tools/configs/vitest.config.js';
 * export default createFoundryTestConfig();
 * 
 * Or with custom options:
 * export default createFoundryTestConfig({
 *   coverage: {
 *     thresholds: {
 *       global: { lines: 90 }
 *     }
 *   }
 * });
 */

const DEFAULT_SETUP_FILE = './test/setup.ts';

function detectSetupFiles() {
  const setupFilePath = resolve(process.cwd(), 'test/setup.ts');
  return existsSync(setupFilePath) ? [DEFAULT_SETUP_FILE] : [];
}

function createDefaultTestConfig() {
  return {
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: detectSetupFiles(),
      reporters: ['default'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'test/',
          'dist/',
          '**/*.d.ts',
          '*.config.*',
          'docs/',
          'templates/',
          'styles/',
          'calendars/',
          'languages/',
          'assets/',
          'scripts/'
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      }
    }
  };
}

/**
 * Create a Vitest configuration for FoundryVTT modules
 * @param {Object} customConfig - Custom configuration to merge with defaults
 * @returns {Object} Vitest configuration
 */
export function createFoundryTestConfig(customConfig = {}) {
  const defaultConfig = createDefaultTestConfig();

  return defineConfig({
    ...defaultConfig,
    test: {
      ...defaultConfig.test,
      ...customConfig.test,
      setupFiles: customConfig.test?.setupFiles ?? defaultConfig.test.setupFiles,
      reporters: customConfig.test?.reporters || defaultConfig.test.reporters,
      coverage: {
        ...defaultConfig.test.coverage,
        ...customConfig.test?.coverage,
        thresholds: {
          ...defaultConfig.test.coverage.thresholds,
          ...customConfig.test?.coverage?.thresholds
        }
      }
    }
  });
}

/**
 * Create a Vitest configuration with JUnit output for CI environments
 * @param {Object} customConfig - Custom configuration to merge with defaults
 * @returns {Object} Vitest configuration with JUnit reporter
 */
export function createFoundryTestConfigWithJUnit(customConfig = {}) {
  return createFoundryTestConfig({
    ...customConfig,
    test: {
      ...customConfig.test,
      reporters: ['default', ['junit', { outputFile: 'test-report.junit.xml' }]]
    }
  });
}

// Export default config for direct use
export default defineConfig(createDefaultTestConfig());