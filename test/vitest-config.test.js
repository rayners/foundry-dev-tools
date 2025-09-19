import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';

const setupFilePath = resolve(process.cwd(), 'test/setup.ts');

async function removeSetupFile() {
  await rm(setupFilePath, { force: true });
}

describe('createFoundryTestConfig', () => {
  beforeEach(async () => {
    await removeSetupFile();
    vi.resetModules();
  });

  afterEach(async () => {
    await removeSetupFile();
    vi.resetModules();
  });

  afterAll(async () => {
    await removeSetupFile();
  });

  it('omits setupFiles when the setup helper is missing', async () => {
    const { createFoundryTestConfig } = await import('../configs/vitest.config.js');

    const config = createFoundryTestConfig();

    expect(config.test.environment).toBe('jsdom');
    expect(config.test.setupFiles).toEqual([]);
  });

  it('includes setupFiles when the helper is present', async () => {
    await mkdir(resolve(process.cwd(), 'test'), { recursive: true });
    await writeFile(setupFilePath, 'export {}\n');

    const { createFoundryTestConfig } = await import('../configs/vitest.config.js');

    const config = createFoundryTestConfig();

    expect(config.test.setupFiles).toEqual(['./test/setup.ts']);
  });

  it('adds the junit reporter helper', async () => {
    const { createFoundryTestConfigWithJUnit } = await import('../configs/vitest.config.js');

    const config = createFoundryTestConfigWithJUnit();

    expect(config.test.reporters).toContainEqual(['junit', { outputFile: 'test-report.junit.xml' }]);
  });
});
