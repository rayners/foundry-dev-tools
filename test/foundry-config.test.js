import { describe, expect, it } from 'vitest';
import { createFoundryConfig, createFoundryConfigWithDir } from '../rollup/foundry-config.js';

describe('createFoundryConfig', () => {
  it('uses the default entry when none is provided', () => {
    const config = createFoundryConfig({ cssFileName: 'styles/module.css' });

    expect(config.input).toBe('src/module.ts');
    expect(config.output).toMatchObject({ file: 'dist/module.js', format: 'es' });
  });

  it('respects a custom entry file', () => {
    const config = createFoundryConfig({
      cssFileName: 'styles/module.css',
      input: 'src/main.ts'
    });

    expect(config.input).toBe('src/main.ts');
  });
});

describe('createFoundryConfigWithDir', () => {
  it('returns a directory output configuration', () => {
    const config = createFoundryConfigWithDir({ cssFileName: 'styles/module.css' });

    expect(config.output).toMatchObject({ dir: 'dist', format: 'es' });
  });
});
