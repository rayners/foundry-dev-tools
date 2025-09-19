import { describe, expect, it } from 'vitest';
import {
  createFoundryConfig,
  createFoundryConfigWithDir,
  createFoundryTestConfig,
  createFoundryTestConfigWithJUnit,
  createSentryConfig,
  createSentryTestConfig,
  eslintConfig,
  prettierConfig,
  vitestConfig
} from '../index.js';

describe('package entry exports', () => {
  it('exposes the rollup helpers', () => {
    expect(typeof createFoundryConfig).toBe('function');
    expect(typeof createFoundryConfigWithDir).toBe('function');
  });

  it('exposes the vitest helpers', () => {
    expect(typeof createFoundryTestConfig).toBe('function');
    expect(typeof createFoundryTestConfigWithJUnit).toBe('function');
  });

  it('exposes the sentry helpers', () => {
    expect(typeof createSentryConfig).toBe('function');
    expect(typeof createSentryTestConfig).toBe('function');
  });

  it('re-exports the shared configs', () => {
    expect(eslintConfig).toBeDefined();
    expect(prettierConfig).toBeDefined();
    expect(vitestConfig).toBeDefined();
  });
});
