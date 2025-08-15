#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class DeploymentValidator {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const prefix = {
      info: `${colors.blue}ℹ${colors.reset}`,
      success: `${colors.green}✓${colors.reset}`,
      error: `${colors.red}✗${colors.reset}`,
      warning: `${colors.yellow}⚠${colors.reset}`,
      test: `${colors.cyan}🧪${colors.reset}`,
    };

    console.log(`${prefix[type]} ${message}`);
  }

  async validateDependencies() {
    this.log('Validating dependencies...', 'test');

    try {
      // Check for security vulnerabilities
      const { stdout: auditOutput } = await execAsync('npm audit --json');
      const audit = JSON.parse(auditOutput);

      if (audit.metadata.vulnerabilities.total > 0) {
        const critical = audit.metadata.vulnerabilities.critical;
        const high = audit.metadata.vulnerabilities.high;

        if (critical > 0 || high > 0) {
          this.results.failed.push(
            `Security vulnerabilities found: ${critical} critical, ${high} high`
          );
          this.log(
            `Security vulnerabilities: ${critical} critical, ${high} high`,
            'error'
          );
        } else {
          this.results.warnings.push(
            `Minor vulnerabilities found: ${audit.metadata.vulnerabilities.total} total`
          );
          this.log(
            `Minor vulnerabilities: ${audit.metadata.vulnerabilities.total}`,
            'warning'
          );
        }
      } else {
        this.results.passed.push('No security vulnerabilities');
        this.log('No security vulnerabilities found', 'success');
      }
    } catch (error) {
      // npm audit might fail if no package-lock.json
      this.log('Could not run security audit', 'warning');
      this.results.warnings.push('Security audit skipped');
    }

    // Check for outdated packages
    try {
      const { stdout } = await execAsync('npm outdated --json');
      const outdated = JSON.parse(stdout || '{}');
      const outdatedCount = Object.keys(outdated).length;

      if (outdatedCount > 0) {
        this.results.warnings.push(`${outdatedCount} outdated packages`);
        this.log(`Found ${outdatedCount} outdated packages`, 'warning');
      } else {
        this.results.passed.push('All packages up to date');
        this.log('All packages are up to date', 'success');
      }
    } catch {
      // npm outdated returns non-zero exit code if packages are outdated
      this.results.warnings.push('Some packages may be outdated');
    }

    // Verify package.json integrity
    const packageJson = JSON.parse(
      await fs.readFile(path.join(__dirname, '../package.json'), 'utf8')
    );

    if (!packageJson.name || !packageJson.version) {
      this.results.failed.push('Invalid package.json');
      this.log('package.json missing required fields', 'error');
    } else {
      this.results.passed.push('Valid package.json');
      this.log('package.json is valid', 'success');
    }
  }

  async runTests() {
    this.log('Running test suite...', 'test');

    try {
      const { stdout, stderr } = await execAsync('npm run test:ci', {
        env: { ...process.env, CI: 'true' },
      });

      // Parse test results
      const testMatch = stdout.match(/Tests:\s+(\d+)\s+passed/);
      const coverageMatch = stdout.match(/Lines\s+:\s+([\d.]+)%/);

      if (testMatch) {
        this.results.passed.push(`${testMatch[1]} tests passed`);
        this.log(`All ${testMatch[1]} tests passed`, 'success');
      }

      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage >= 70) {
          this.results.passed.push(`Code coverage: ${coverage}%`);
          this.log(`Code coverage: ${coverage}%`, 'success');
        } else {
          this.results.warnings.push(`Low code coverage: ${coverage}%`);
          this.log(`Code coverage below threshold: ${coverage}%`, 'warning');
        }
      }
    } catch (error) {
      this.results.failed.push('Test suite failed');
      this.log('Test suite failed', 'error');
      console.error(error.message);
    }
  }

  async validateBuild() {
    this.log('Validating production build...', 'test');

    try {
      // Run production build
      this.log('Building for production...', 'info');
      await execAsync('npm run build');

      // Check if dist folder exists
      const distPath = path.join(__dirname, '../dist');
      const distStats = await fs.stat(distPath);

      if (!distStats.isDirectory()) {
        throw new Error('Build output directory not found');
      }

      // Check build size
      const { stdout } = await execAsync(`du -sh ${distPath}`);
      const sizeMatch = stdout.match(/^([\d.]+[KMG])/);

      if (sizeMatch) {
        this.results.passed.push(`Build size: ${sizeMatch[1]}`);
        this.log(`Build size: ${sizeMatch[1]}`, 'success');
      }

      // Verify critical files exist
      const criticalFiles = ['index.html', 'assets'];

      for (const file of criticalFiles) {
        const filePath = path.join(distPath, file);
        try {
          await fs.access(filePath);
          this.log(`✓ ${file} exists`, 'success');
        } catch {
          this.results.failed.push(`Missing critical file: ${file}`);
          this.log(`Missing critical file: ${file}`, 'error');
        }
      }

      // Check for source maps in production
      const files = await fs.readdir(path.join(distPath, 'assets'));
      const sourceMaps = files.filter(f => f.endsWith('.map'));

      if (sourceMaps.length > 0) {
        this.results.warnings.push('Source maps found in production build');
        this.log('Warning: Source maps in production build', 'warning');
      }

      this.results.passed.push('Production build successful');
      this.log('Production build validated', 'success');
    } catch (error) {
      this.results.failed.push('Build validation failed');
      this.log('Build validation failed', 'error');
      console.error(error.message);
    }
  }

  async validateTypeScript() {
    this.log('Validating TypeScript...', 'test');

    try {
      await execAsync('npm run type-check');
      this.results.passed.push('TypeScript validation passed');
      this.log('TypeScript validation passed', 'success');
    } catch (error) {
      this.results.failed.push('TypeScript errors found');
      this.log('TypeScript validation failed', 'error');
    }
  }

  async validateLinting() {
    this.log('Running linter...', 'test');

    try {
      await execAsync('npm run lint');
      this.results.passed.push('Linting passed');
      this.log('No linting errors', 'success');
    } catch (error) {
      this.results.warnings.push('Linting warnings/errors');
      this.log('Linting issues found', 'warning');
    }
  }

  async validateEnvironment() {
    this.log('Validating environment...', 'test');

    // Check Node.js version
    const { stdout: nodeVersion } = await execAsync('node --version');
    const nodeMajor = parseInt(nodeVersion.match(/v(\d+)/)[1]);

    if (nodeMajor >= 18) {
      this.results.passed.push(`Node.js ${nodeVersion.trim()}`);
      this.log(`Node.js version: ${nodeVersion.trim()}`, 'success');
    } else {
      this.results.failed.push(
        `Node.js version too old: ${nodeVersion.trim()}`
      );
      this.log(
        `Node.js version too old: ${nodeVersion.trim()} (need 18+)`,
        'error'
      );
    }

    // Check npm version
    const { stdout: npmVersion } = await execAsync('npm --version');
    this.log(`npm version: ${npmVersion.trim()}`, 'info');
  }

  async validatePerformance() {
    this.log('Validating performance metrics...', 'test');

    // Check bundle size
    try {
      const distPath = path.join(__dirname, '../dist/assets');
      const files = await fs.readdir(distPath);

      let totalSize = 0;
      let jsSize = 0;
      let cssSize = 0;

      for (const file of files) {
        const stats = await fs.stat(path.join(distPath, file));
        totalSize += stats.size;

        if (file.endsWith('.js')) jsSize += stats.size;
        if (file.endsWith('.css')) cssSize += stats.size;
      }

      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
      const jsSizeMB = (jsSize / 1024 / 1024).toFixed(2);
      const cssSizeMB = (cssSize / 1024 / 1024).toFixed(2);

      this.log(
        `Bundle sizes - Total: ${totalSizeMB}MB, JS: ${jsSizeMB}MB, CSS: ${cssSizeMB}MB`,
        'info'
      );

      if (totalSize < 1024 * 1024) {
        // Less than 1MB
        this.results.passed.push(`Excellent bundle size: ${totalSizeMB}MB`);
        this.log('Bundle size is excellent', 'success');
      } else if (totalSize < 2 * 1024 * 1024) {
        // Less than 2MB
        this.results.passed.push(`Good bundle size: ${totalSizeMB}MB`);
        this.log('Bundle size is good', 'success');
      } else {
        this.results.warnings.push(`Large bundle size: ${totalSizeMB}MB`);
        this.log('Bundle size could be optimized', 'warning');
      }
    } catch (error) {
      this.log('Could not analyze bundle size', 'warning');
    }
  }

  async validateModelIntegration() {
    this.log('Validating AI model integration...', 'test');

    // Check if model files exist
    const modelFiles = [
      'src/ai/OpenSourcePokerAI.ts',
      'src/utils/pokerEngine.ts',
    ];

    for (const file of modelFiles) {
      const filePath = path.join(__dirname, '..', file);
      try {
        await fs.access(filePath);
        this.log(`✓ ${file} exists`, 'success');
      } catch {
        this.results.failed.push(`Missing model file: ${file}`);
        this.log(`Missing model file: ${file}`, 'error');
      }
    }

    // Check for model tests
    const testFiles = [
      'src/ai/__tests__/OpenSourcePokerAI.test.ts',
      'src/utils/__tests__/pokerEngine.test.ts',
    ];

    let testsFound = 0;
    for (const file of testFiles) {
      const filePath = path.join(__dirname, '..', file);
      try {
        await fs.access(filePath);
        testsFound++;
      } catch {
        // Test file not found
      }
    }

    if (testsFound === testFiles.length) {
      this.results.passed.push('All model tests present');
      this.log('All model tests present', 'success');
    } else {
      this.results.warnings.push(
        `Only ${testsFound}/${testFiles.length} model tests found`
      );
      this.log(
        `Only ${testsFound}/${testFiles.length} model tests found`,
        'warning'
      );
    }
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log(`${colors.bright}DEPLOYMENT VALIDATION REPORT${colors.reset}`);
    console.log('='.repeat(60));

    if (this.results.passed.length > 0) {
      console.log(
        `\n${colors.green}${colors.bright}✓ PASSED (${this.results.passed.length})${colors.reset}`
      );
      this.results.passed.forEach(item =>
        console.log(`  ${colors.green}✓${colors.reset} ${item}`)
      );
    }

    if (this.results.warnings.length > 0) {
      console.log(
        `\n${colors.yellow}${colors.bright}⚠ WARNINGS (${this.results.warnings.length})${colors.reset}`
      );
      this.results.warnings.forEach(item =>
        console.log(`  ${colors.yellow}⚠${colors.reset} ${item}`)
      );
    }

    if (this.results.failed.length > 0) {
      console.log(
        `\n${colors.red}${colors.bright}✗ FAILED (${this.results.failed.length})${colors.reset}`
      );
      this.results.failed.forEach(item =>
        console.log(`  ${colors.red}✗${colors.reset} ${item}`)
      );
    }

    console.log('\n' + '='.repeat(60));

    const status = this.results.failed.length === 0 ? 'READY' : 'NOT READY';
    const statusColor =
      this.results.failed.length === 0 ? colors.green : colors.red;

    console.log(
      `${colors.bright}Deployment Status: ${statusColor}${status}${colors.reset}`
    );
    console.log(`Validation completed in ${duration}s`);
    console.log('='.repeat(60) + '\n');

    // Return exit code
    return this.results.failed.length === 0 ? 0 : 1;
  }

  async run() {
    console.log(
      `${colors.bright}${colors.cyan}🚀 Starting Deployment Validation...${colors.reset}\n`
    );

    const validations = [
      { name: 'Environment', fn: () => this.validateEnvironment() },
      { name: 'Dependencies', fn: () => this.validateDependencies() },
      { name: 'TypeScript', fn: () => this.validateTypeScript() },
      { name: 'Linting', fn: () => this.validateLinting() },
      { name: 'Tests', fn: () => this.runTests() },
      { name: 'Build', fn: () => this.validateBuild() },
      { name: 'Performance', fn: () => this.validatePerformance() },
      { name: 'Model Integration', fn: () => this.validateModelIntegration() },
    ];

    for (const validation of validations) {
      console.log(`\n${colors.bright}[${validation.name}]${colors.reset}`);
      try {
        await validation.fn();
      } catch (error) {
        this.log(
          `${validation.name} validation error: ${error.message}`,
          'error'
        );
        this.results.failed.push(`${validation.name} validation failed`);
      }
    }

    const exitCode = this.generateReport();

    if (exitCode === 0) {
      console.log(
        `${colors.green}${colors.bright}✅ Your app is ready for deployment!${colors.reset}`
      );
      console.log(
        `${colors.cyan}Deploy with: npm run build && <your-deploy-command>${colors.reset}\n`
      );
    } else {
      console.log(
        `${colors.red}${colors.bright}❌ Please fix the issues above before deploying.${colors.reset}\n`
      );
    }

    process.exit(exitCode);
  }
}

// Run validation
const validator = new DeploymentValidator();
validator.run().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
