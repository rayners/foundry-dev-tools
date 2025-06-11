#!/usr/bin/env node

/**
 * Link or copy a Foundry module to a Foundry VTT installation for testing
 * 
 * Usage:
 *   node ../foundry-dev-tools/scripts/link-module.js /path/to/foundry/Data/modules
 *   node ../foundry-dev-tools/scripts/link-module.js --copy /path/to/foundry/Data/modules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function showUsage() {
  console.log('Foundry Module Linker');
  console.log('====================');
  console.log('');
  console.log('Usage:');
  console.log('  node ../foundry-dev-tools/scripts/link-module.js [options] /path/to/foundry/Data/modules');
  console.log('');
  console.log('Options:');
  console.log('  --copy    Copy files instead of creating symlinks');
  console.log('  --help    Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  # Link to Electron Foundry (macOS)');
  console.log('  node ../foundry-dev-tools/scripts/link-module.js ~/Library/Application\\ Support/FoundryVTT/Data/modules');
  console.log('');
  console.log('  # Link to Node.js Foundry');
  console.log('  node ../foundry-dev-tools/scripts/link-module.js /path/to/foundrydata/modules');
  console.log('');
  console.log('  # Copy instead of link (safer for some setups)');
  console.log('  node ../foundry-dev-tools/scripts/link-module.js --copy /path/to/foundrydata/modules');
  console.log('');
  console.log('Common Foundry Data Paths:');
  console.log('  macOS Electron: ~/Library/Application Support/FoundryVTT/Data/modules');
  console.log('  Windows Electron: %LOCALAPPDATA%/FoundryVTT/Data/modules');
  console.log('  Linux Electron: ~/.local/share/FoundryVTT/Data/modules');
}

function getModuleInfo(projectRoot) {
  // Try to read module.json
  const moduleJsonPath = path.join(projectRoot, 'module.json');
  if (!fs.existsSync(moduleJsonPath)) {
    console.error('❌ No module.json found in current directory');
    console.log('💡 Make sure you run this from a Foundry module directory');
    process.exit(1);
  }

  const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
  return {
    id: moduleJson.id || moduleJson.name,
    name: moduleJson.title || moduleJson.id || moduleJson.name
  };
}

function copyRecursive(src, dest, excludePatterns = []) {
  const basename = path.basename(src);
  
  // Check if this file/directory should be excluded
  for (const pattern of excludePatterns) {
    if (basename === pattern || src.endsWith(pattern)) {
      return;
    }
  }

  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file),
        excludePatterns
      );
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function linkModule(foundryModulesPath, useCopy = false) {
  const projectRoot = process.cwd();
  const moduleInfo = getModuleInfo(projectRoot);
  
  console.log(`🔧 Linking module: ${moduleInfo.name} (${moduleInfo.id})`);
  
  // Ensure the foundry modules directory exists
  if (!fs.existsSync(foundryModulesPath)) {
    console.error(`❌ Foundry modules directory not found: ${foundryModulesPath}`);
    console.log('💡 Make sure Foundry VTT is installed and the path is correct');
    process.exit(1);
  }

  const targetPath = path.join(foundryModulesPath, moduleInfo.id);
  
  // Remove existing link/directory
  if (fs.existsSync(targetPath)) {
    console.log(`🗑️  Removing existing module at ${targetPath}`);
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  if (useCopy) {
    console.log(`📂 Copying module to ${targetPath}`);
    
    // Exclude development files when copying
    const excludePatterns = [
      'node_modules',
      '.git',
      '.gitignore',
      'src',
      'test',
      'scripts',
      'README.md',
      'CONTRIBUTING.md',
      'CLAUDE.md',
      'tsconfig.json',
      'vitest.config.ts',
      'rollup.config.js',
      'package.json',
      'package-lock.json',
      '.eslintrc.json',
      'eslint.config.js',
      'prettier.config.js'
    ];
    
    copyRecursive(projectRoot, targetPath, excludePatterns);
  } else {
    console.log(`🔗 Creating symlink from ${projectRoot} to ${targetPath}`);
    try {
      fs.symlinkSync(projectRoot, targetPath, 'dir');
    } catch (error) {
      if (error.code === 'EPERM') {
        console.error('❌ Permission denied creating symlink.');
        console.log('💡 Try running with elevated permissions or use --copy flag');
        process.exit(1);
      }
      if (error.code === 'EEXIST') {
        console.error('❌ Target already exists (this should not happen)');
        process.exit(1);
      }
      throw error;
    }
  }

  console.log('✅ Module linked successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Start/restart Foundry VTT');
  console.log('2. Create or open a test world');
  console.log(`3. Enable the "${moduleInfo.name}" module in Module Management`);
  console.log('4. Test the module functionality');
  console.log('');
  
  if (!useCopy) {
    console.log('💡 Development mode (symlink):');
    console.log('   - Changes to templates, styles, and dist/ are reflected immediately');
    console.log('   - Run your build command after making source changes');
    console.log('   - F5 refresh in Foundry to see changes');
  } else {
    console.log('💡 Copy mode:');
    console.log('   - Run this script again after making changes');
    console.log('   - Foundry may need restart for some changes');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let foundryPath = null;
let useCopy = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    showUsage();
    process.exit(0);
  } else if (arg === '--copy') {
    useCopy = true;
  } else if (!foundryPath && !arg.startsWith('--')) {
    foundryPath = path.resolve(arg);
  }
}

if (!foundryPath) {
  console.error('❌ No Foundry modules path provided');
  console.log('');
  showUsage();
  process.exit(1);
}

linkModule(foundryPath, useCopy);