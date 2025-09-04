#!/usr/bin/env node

/**
 * RFID Platform Setup Script
 * Initializes the development environment
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options })
    return true
  } catch (error) {
    log(`Error executing: ${command}`, 'red')
    log(error.message, 'red')
    return false
  }
}

function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest)
    log(`✓ Copied ${src} to ${dest}`, 'green')
    return true
  } catch (error) {
    log(`✗ Failed to copy ${src}: ${error.message}`, 'red')
    return false
  }
}

function createEnvFile(templatePath, destPath) {
  if (fs.existsSync(destPath)) {
    log(`⚠ ${destPath} already exists, skipping`, 'yellow')
    return true
  }
  
  if (fs.existsSync(templatePath)) {
    return copyFile(templatePath, destPath)
  } else {
    log(`⚠ Template ${templatePath} not found, creating empty file`, 'yellow')
    fs.writeFileSync(destPath, '# Environment variables\n')
    return true
  }
}

async function main() {
  log('🚀 RFID Platform Setup', 'bright')
  log('====================', 'bright')
  log('')

  // Check prerequisites
  log('📋 Checking prerequisites...', 'blue')
  
  const nodeVersion = exec('node --version', { stdio: 'pipe' })
  const npmVersion = exec('npm --version', { stdio: 'pipe' })
  const pythonVersion = exec('python3 --version', { stdio: 'pipe' })
  const dockerVersion = exec('docker --version', { stdio: 'pipe' })
  
  if (!nodeVersion || !npmVersion) {
    log('✗ Node.js and npm are required', 'red')
    process.exit(1)
  }
  
  if (!pythonVersion) {
    log('✗ Python 3 is required', 'red')
    process.exit(1)
  }
  
  if (!dockerVersion) {
    log('⚠ Docker is recommended for local development', 'yellow')
  }
  
  log('✓ Prerequisites check complete', 'green')
  log('')

  // Create environment files
  log('📝 Creating environment files...', 'blue')
  
  const envFiles = [
    { template: '.env.example', dest: '.env.local' },
    { template: 'apps/dashboard/.env.example', dest: 'apps/dashboard/.env.local' },
    { template: 'apps/gateway/.env.example', dest: 'apps/gateway/.env.local' },
    { template: 'apps/ingest-worker/.env.example', dest: 'apps/ingest-worker/.env.local' },
  ]
  
  for (const { template, dest } of envFiles) {
    createEnvFile(template, dest)
  }
  
  log('✓ Environment files created', 'green')
  log('')

  // Install dependencies
  log('📦 Installing dependencies...', 'blue')
  
  // Root dependencies
  if (exec('npm install')) {
    log('✓ Root dependencies installed', 'green')
  } else {
    log('✗ Failed to install root dependencies', 'red')
    process.exit(1)
  }
  
  // Dashboard dependencies
  log('Installing dashboard dependencies...', 'cyan')
  if (exec('npm install', { cwd: 'apps/dashboard' })) {
    log('✓ Dashboard dependencies installed', 'green')
  } else {
    log('✗ Failed to install dashboard dependencies', 'red')
  }
  
  // Gateway dependencies
  log('Installing gateway dependencies...', 'cyan')
  if (exec('pip install -r requirements.txt', { cwd: 'apps/gateway' })) {
    log('✓ Gateway dependencies installed', 'green')
  } else {
    log('✗ Failed to install gateway dependencies', 'red')
  }
  
  // Worker dependencies
  log('Installing worker dependencies...', 'cyan')
  if (exec('pip install -r requirements.txt', { cwd: 'apps/ingest-worker' })) {
    log('✓ Worker dependencies installed', 'green')
  } else {
    log('✗ Failed to install worker dependencies', 'red')
  }
  
  // Shared dependencies
  if (fs.existsSync('packages/shared/package.json')) {
    log('Installing shared dependencies...', 'cyan')
    if (exec('npm install', { cwd: 'packages/shared' })) {
      log('✓ Shared dependencies installed', 'green')
    } else {
      log('✗ Failed to install shared dependencies', 'red')
    }
  }
  
  log('✓ Dependencies installation complete', 'green')
  log('')

  // Setup Supabase
  log('🗄️ Setting up Supabase...', 'blue')
  
  if (exec('npx supabase --version', { stdio: 'pipe' })) {
    log('Supabase CLI found', 'green')
  } else {
    log('Installing Supabase CLI...', 'cyan')
    if (exec('npm install -g supabase')) {
      log('✓ Supabase CLI installed', 'green')
    } else {
      log('⚠ Failed to install Supabase CLI', 'yellow')
    }
  }
  
  log('✓ Supabase setup complete', 'green')
  log('')

  // Setup database
  log('🗄️ Setting up database...', 'blue')
  
  if (exec('npx supabase start')) {
    log('✓ Supabase started', 'green')
    
    if (exec('npx supabase db reset --local')) {
      log('✓ Database reset complete', 'green')
    } else {
      log('⚠ Database reset failed', 'yellow')
    }
    
    if (exec('npx supabase db seed --local')) {
      log('✓ Database seeded', 'green')
    } else {
      log('⚠ Database seeding failed', 'yellow')
    }
  } else {
    log('⚠ Failed to start Supabase', 'yellow')
    log('Please run: npx supabase start', 'yellow')
  }
  
  log('✓ Database setup complete', 'green')
  log('')

  // Build applications
  log('🏗️ Building applications...', 'blue')
  
  // Build dashboard
  log('Building dashboard...', 'cyan')
  if (exec('npm run build', { cwd: 'apps/dashboard' })) {
    log('✓ Dashboard built successfully', 'green')
  } else {
    log('⚠ Dashboard build failed', 'yellow')
  }
  
  log('✓ Build process complete', 'green')
  log('')

  // Final instructions
  log('🎉 Setup Complete!', 'bright')
  log('==================', 'bright')
  log('')
  log('Next steps:', 'blue')
  log('1. Configure environment variables in .env.local files', 'cyan')
  log('2. Start the development servers:', 'cyan')
  log('   npm run dev', 'green')
  log('')
  log('3. Access the applications:', 'cyan')
  log('   Dashboard: http://localhost:3000', 'green')
  log('   Gateway: http://localhost:8000', 'green')
  log('   Supabase: http://localhost:54323', 'green')
  log('')
  log('4. Run tests:', 'cyan')
  log('   npm test', 'green')
  log('')
  log('5. Deploy to production:', 'cyan')
  log('   npm run deploy', 'green')
  log('')
  log('For more information, see docs/DEPLOY.md', 'blue')
  log('')
  log('Happy coding! 🚀', 'magenta')
}

if (require.main === module) {
  main().catch((error) => {
    log(`Setup failed: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { main }