# @rayners/foundry-dev-tools

Shared development tools and configurations for FoundryVTT modules.

## Installation

```bash
npm install --save-dev @rayners/foundry-dev-tools
```

## Usage

All of the runtime helpers are re-exported from the package entry point, so a single `@rayners/foundry-dev-tools` import covers Rollup builders, Vitest presets, and the Sentry utilities described below.

### Rollup Configuration

Create or update your `rollup.config.js`:

```javascript
import { createFoundryConfig } from '@rayners/foundry-dev-tools';

export default createFoundryConfig({
  cssFileName: 'styles/your-module-name.css',
  additionalCopyTargets: [
    { src: 'assets/**/*', dest: 'dist/' },
    { src: 'calendars', dest: 'dist' }
  ]
});
```

For modules that need directory output (like J&J):

```javascript
import { createFoundryConfigWithDir } from '@rayners/foundry-dev-tools';

export default createFoundryConfigWithDir({
  cssFileName: 'styles/journeys-and-jamborees.css',
  additionalCopyTargets: [
    { src: 'templates/partials/*.hbs', dest: 'dist/templates/partials/' }
  ]
});
```

### TypeScript Configuration

Create or update your `tsconfig.json`:

```json
{
  "extends": "@rayners/foundry-dev-tools/tsconfig",
  "compilerOptions": {
    "types": ["jquery"],
    "typeRoots": ["./node_modules/@types", "./src/types"]
  }
}
```

### ESLint Configuration

Create or update `eslint.config.js`:

```javascript
import foundryConfig from '@rayners/foundry-dev-tools/eslint';

export default [
  ...foundryConfig
];
```

> **Type-aware linting requires a project file.** The shared preset enables `parserOptions.project`, so make sure a `tsconfig.json` exists at your project root (or adjust the option before exporting).

### Prettier Configuration

Create `prettier.config.js`:

```javascript
export { default } from '@rayners/foundry-dev-tools/prettier';
```

Or add to your `package.json`:

```json
{
  "prettier": "@rayners/foundry-dev-tools/prettier"
}
```

### Vitest Configuration

Create or update your `vitest.config.ts`:

```javascript
import { createFoundryTestConfig } from '@rayners/foundry-dev-tools';

export default createFoundryTestConfig();
```

With custom coverage thresholds:

```javascript
export default createFoundryTestConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          lines: 90,
          functions: 90
        }
      }
    }
  }
});
```

Need CI-friendly output?

```javascript
import { createFoundryTestConfigWithJUnit } from '@rayners/foundry-dev-tools';

export default createFoundryTestConfigWithJUnit();
```

> The shared preset automatically includes `./test/setup.ts` when the file exists. Projects without that helper can use the preset as-is—Vitest will receive an empty `setupFiles` array.

### Sentry Sourcemap Uploads

The Sentry helpers are also available from the package entry point:

```javascript
import { createSentryConfig } from '@rayners/foundry-dev-tools';

export default {
  plugins: [
    createSentryConfig('my-module', process.env.MODULE_VERSION)
  ]
};
```

Uploads only run when `UPLOAD_SOURCE_MAPS` is truthy and `SENTRY_AUTH_TOKEN` is present, making it safe to keep the plugin wired into local builds. For CI smoke tests, use `createSentryTestConfig` to keep the release plugin registered without attempting an upload.

## Features

- **Standardized Rollup Configuration**: Automatic SCSS compilation, file copying, and GitHub release URL injection
- **TypeScript Configuration**: Optimized for FoundryVTT module development
- **ESLint Rules**: Foundry-specific globals and TypeScript best practices
- **Prettier Formatting**: Consistent code formatting across all modules
- **Vitest Testing**: Pre-configured for FoundryVTT module testing with jsdom environment
- **Sentry Integration**: Optional helpers to upload release sourcemaps only when CI variables are present
- **Development Server**: Built-in dev server with live reload for faster development

## Configuration Options

### Rollup Options

- `cssFileName`: **Required** - Output path for compiled CSS
- `input`: Override the Rollup entry file (default: `src/module.ts`)
- `additionalCopyTargets`: Additional files to copy to dist
- `scssOptions`: Override SCSS plugin options
- `typescriptOptions`: Override TypeScript plugin options  
- `useDevServer`: Enable development server (default: `process.env.SERVE === 'true'`)
- `devServerPort`: Development server port (default: 30000)
- `outputFormat`: 'es' for single file, 'dir' for directory output

### Package.json Updates

After installing, you can remove these duplicate dependencies from your modules:

```json
{
  "devDependencies": {
    // Remove these - they're now provided by @rayners/foundry-dev-tools
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-typescript": "^11.0.0", 
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "@vitest/coverage-v8": "^3.1.4",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-prettier": "^5.4.0",
    "jsdom": "^26.1.0",
    "rollup-plugin-copy": "^3.4.0",
    "rollup-plugin-scss": "^4.0.0",
    "sass": "^1.62.0",
    "tslib": "^2.5.0"
  }
}
```

### Foundry Type Definitions

The bundled `types/foundry-v13-essentials.d.ts` file intentionally covers a "minimal but complete" slice of the Foundry VTT v13 API. Check for upstream changes whenever Foundry ships a new major release so your modules continue to receive accurate type hints (and feel free to contribute updates back here!).

## GitHub Packages

This package is published to GitHub Packages. Make sure your `.npmrc` includes:

```
@rayners:registry=https://npm.pkg.github.com
```

## License

MIT