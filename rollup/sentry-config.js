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

  // Only enable for actual releases, not CI builds
  const isReleaseBuild = process.env.NODE_ENV === 'production' || process.env.GITHUB_EVENT_NAME === 'release';
  
  // Check if we already uploaded for this version (prevents duplicate uploads in multi-build workflows)
  const uploadMarkerFile = `.sentry-uploaded-${moduleId}-${version}`;
  const alreadyUploaded = (() => {
    try {
      const fs = require('fs');
      return fs.existsSync(uploadMarkerFile);
    } catch (error) {
      return false; // If fs not available, proceed with upload
    }
  })();
  
  const shouldUpload = !skipUpload && isReleaseBuild && process.env.SENTRY_AUTH_TOKEN && !alreadyUploaded;

  if (!shouldUpload) {
    const reason = alreadyUploaded ? 'already uploaded' : 'not release build or missing token';
    console.log(`ℹ️ Sentry sourcemap upload disabled for ${moduleId} (${reason})`);
    return null; // Return null to exclude from plugins array
  }

  const releaseName = `${moduleId}@${version}`;
  
  console.log(`🚀 Configuring Sentry sourcemap upload for ${releaseName}`);

  const sentryPlugin = sentryRollupPlugin({
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

  // Add hook to create marker file after successful upload
  const originalBuildEnd = sentryPlugin.buildEnd || (() => {});
  sentryPlugin.buildEnd = function(...args) {
    const result = originalBuildEnd.apply(this, args);
    
    // Create marker file after successful upload
    try {
      const fs = require('fs');
      fs.writeFileSync(uploadMarkerFile, `Uploaded ${releaseName} at ${new Date().toISOString()}`);
      console.log(`✅ Created Sentry upload marker: ${uploadMarkerFile}`);
    } catch (error) {
      console.warn('⚠️ Failed to create Sentry upload marker:', error.message);
    }
    
    return result;
  };

  return sentryPlugin;
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