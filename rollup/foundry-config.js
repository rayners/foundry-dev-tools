import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Custom plugin to inject release URLs into module.json during GitHub releases
 */
function injectReleaseUrls() {
  return {
    name: 'inject-release-urls',
    generateBundle() {
      const moduleVersion = process.env.MODULE_VERSION;
      const ghProject = process.env.GH_PROJECT;
      const ghTag = process.env.GH_TAG;

      if (moduleVersion && ghProject && ghTag) {
        const moduleJsonPath = join('dist', 'module.json');

        try {
          const moduleJson = JSON.parse(readFileSync(moduleJsonPath, 'utf8'));
          
          moduleJson.manifest = `https://github.com/${ghProject}/releases/download/${ghTag}/module.json`;
          moduleJson.download = `https://github.com/${ghProject}/releases/download/${ghTag}/module.zip`;
          
          writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 2));
          console.log(`✅ Injected release URLs for ${ghTag}`);
        } catch (error) {
          console.warn('⚠️ Could not inject release URLs:', error.message);
        }
      } else {
        console.log('ℹ️ Skipping URL injection (not a release build)');
      }
    }
  };
}

/**
 * Standard copy targets for FoundryVTT modules
 */
const standardCopyTargets = [
  { src: 'module.json', dest: 'dist' },
  { src: 'languages', dest: 'dist' },
  { src: 'templates', dest: 'dist' },
  { src: 'README.md', dest: 'dist' },
  { src: 'CHANGELOG.md', dest: 'dist' },
  { src: 'LICENSE', dest: 'dist' }
];

/**
 * Create a standardized Foundry VTT module rollup configuration
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.cssFileName - CSS output filename (e.g., 'styles/module-name.css')
 * @param {Array} [options.additionalCopyTargets] - Additional files to copy
 * @param {Object} [options.scssOptions] - Additional SCSS plugin options
 * @param {Object} [options.typescriptOptions] - Additional TypeScript plugin options
 * @param {boolean} [options.useDevServer] - Enable development server (default: false)
 * @param {number} [options.devServerPort] - Development server port (default: 30000)
 * @param {string} [options.outputFormat] - Output format: 'es' | 'dir' (default: 'es')
 * @returns {Object} Rollup configuration
 */
export function createFoundryConfig(options = {}) {
  const {
    cssFileName,
    additionalCopyTargets = [],
    scssOptions = {},
    typescriptOptions = {},
    useDevServer = process.env.SERVE === 'true',
    devServerPort = 30000,
    outputFormat = 'es'
  } = options;

  if (!cssFileName) {
    throw new Error('cssFileName is required for FoundryVTT module build');
  }

  // Merge copy targets
  const copyTargets = [...standardCopyTargets, ...additionalCopyTargets];

  // Configure output based on format preference
  const output = outputFormat === 'dir' 
    ? {
        dir: 'dist',
        format: 'es',
        sourcemap: true
      }
    : {
        file: 'dist/module.js',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true
      };

  // Build plugins array
  const plugins = [
    resolve(),
    typescript(typescriptOptions),
    scss({
      fileName: cssFileName,
      sourceMap: true,
      watch: ['src/styles', 'styles'],
      includePaths: ['styles', 'src/styles'],
      failOnError: true,
      ...scssOptions
    }),
    copy({ targets: copyTargets }),
    injectReleaseUrls()
  ];

  // Add development server plugins if enabled
  if (useDevServer) {
    plugins.push(
      serve({
        contentBase: 'dist',
        port: devServerPort
      }),
      livereload('dist')
    );
  }

  return {
    input: 'src/module.ts',
    output,
    plugins: plugins.filter(Boolean) // Remove any undefined plugins
  };
}

/**
 * Convenience function for modules that need the older dir-based output
 */
export function createFoundryConfigWithDir(options = {}) {
  return createFoundryConfig({
    ...options,
    outputFormat: 'dir'
  });
}

export default createFoundryConfig;