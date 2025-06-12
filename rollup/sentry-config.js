import { sentryRollupPlugin } from '@sentry/rollup-plugin';

/**
 * Create a Sentry sourcemap configuration for FoundryVTT modules
 * 
 * @param {string} moduleId - The module ID (should match module.json id field)
 * @param {string} version - The module version (should match package.json version)
 * @param {Object} [options={}] - Additional configuration options
 * @param {string} [options.org] - Sentry organization (default: "rayners")
 * @param {string} [options.project] - Sentry project (default: "foundry-reports")
 * @param {boolean} [options.skipUpload] - Skip sourcemap upload (for testing)
 * @param {Object} [options.releaseOptions] - Additional release configuration
 * @param {Object} [options.pluginOptions] - Additional plugin configuration
 * @returns {Object} Sentry rollup plugin configuration
 */
export function createSentryConfig(moduleId, version, options = {}) {
  const {
    org = 'rayners',
    project = 'foundry-modules',
    skipUpload = false,
    releaseOptions = {},
    pluginOptions = {}
  } = options;

  // Only enable in CI/release environments unless explicitly overridden
  const isReleaseBuild = process.env.CI === 'true' || process.env.NODE_ENV === 'production';
  const shouldUpload = !skipUpload && isReleaseBuild && process.env.SENTRY_AUTH_TOKEN;

  if (!shouldUpload) {
    console.log(`ℹ️ Sentry sourcemap upload disabled for ${moduleId} (CI: ${process.env.CI}, NODE_ENV: ${process.env.NODE_ENV}, Token: ${!!process.env.SENTRY_AUTH_TOKEN})`);
    return null; // Return null to exclude from plugins array
  }

  const releaseName = `${moduleId}@${version}`;
  
  console.log(`🚀 Configuring Sentry sourcemap upload for ${releaseName}`);

  return sentryRollupPlugin({
    authToken: process.env.SENTRY_AUTH_TOKEN,
    org,
    project,
    release: {
      name: releaseName,
      // Automatically create and finalize the release
      create: true,
      finalize: true,
      ...releaseOptions
    },
    sourcemaps: {
      assets: ['./dist/**/*.js'],
      urlPrefix: `~/modules/${moduleId}/`,
      filesToDeleteAfterUpload: ['./dist/**/*.js.map'] // Clean up sourcemap files after upload
    },
    errorHandler: (error) => {
      console.warn('⚠️ Sentry sourcemap upload failed:', error.message);
      // Don't fail the build if sourcemap upload fails
      return false;
    },
    ...pluginOptions
  });
}

/**
 * Create a test-only Sentry configuration (always skips upload)
 * Useful for local development and testing
 */
export function createSentryTestConfig(moduleId, version, options = {}) {
  return createSentryConfig(moduleId, version, {
    ...options,
    skipUpload: true
  });
}

export default createSentryConfig;