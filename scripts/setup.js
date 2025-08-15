#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SetupWizard {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    this.projectRoot = path.join(__dirname, '..')
  }

  async run() {
    console.log('🤖 AI Poker Solver Setup Wizard')
    console.log('================================\n')

    try {
      await this.checkPrerequisites()
      await this.setupEnvironment()
      await this.installDependencies()
      await this.setupDatabase()
      await this.configureAI()
      await this.runInitialScraping()
      await this.finalizeSetup()

      console.log('\n✅ Setup completed successfully!')
      console.log('\n🚀 Next steps:')
      console.log('1. Start the development server: npm run dev')
      console.log('2. Open http://localhost:5173 in your browser')
      console.log('3. Configure your OpenAI API key in .env')
      console.log('4. Run data scraping: npm run scrape-data')
      console.log('5. Train the model: npm run train-model')

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message)
      process.exit(1)
    } finally {
      this.rl.close()
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...')

    // Check Node.js version
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required. Current version: ${nodeVersion}`)
    }

    // Check npm version
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
      console.log(`✅ Node.js ${nodeVersion}, npm ${npmVersion}`)
    } catch (error) {
      throw new Error('npm not found. Please install Node.js and npm.')
    }

    // Check if we're in the right directory
    if (!fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
      throw new Error('package.json not found. Please run this script from the project root.')
    }
  }

  async setupEnvironment() {
    console.log('\n⚙️  Setting up environment...')

    const envPath = path.join(this.projectRoot, '.env')
    const envExamplePath = path.join(this.projectRoot, '.env.example')

    if (!fs.existsSync(envExamplePath)) {
      throw new Error('.env.example not found')
    }

    if (fs.existsSync(envPath)) {
      const answer = await this.question('.env already exists. Overwrite? (y/N): ')
      if (answer.toLowerCase() !== 'y') {
        console.log('Skipping environment setup...')
        return
      }
    }

    // Copy .env.example to .env
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ Environment file created')

    // Create necessary directories
    const dirs = ['data', 'logs', 'src/ai']
    for (const dir of dirs) {
      const dirPath = path.join(this.projectRoot, dir)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
    }
    console.log('✅ Directories created')
  }

  async installDependencies() {
    console.log('\n📦 Installing dependencies...')

    try {
      execSync('npm install', { 
        cwd: this.projectRoot, 
        stdio: 'inherit' 
      })
      console.log('✅ Dependencies installed')
    } catch (error) {
      throw new Error('Failed to install dependencies. Please check your internet connection.')
    }
  }

  async setupDatabase() {
    console.log('\n🗄️  Setting up database...')

    try {
      // Create initial database schema
      const dbPath = path.join(this.projectRoot, 'data/poker_data.db')
      
      // Import and run database setup
      const { PokerDataScraper } = await import('../src/scripts/scrapePokerData.js')
      const scraper = new PokerDataScraper()
      await scraper.initialize()
      await scraper.cleanup()

      console.log('✅ Database initialized')
    } catch (error) {
      console.warn('⚠️  Database setup failed, will retry later:', error.message)
    }
  }

  async configureAI() {
    console.log('\n🤖 Configuring AI system...')

    // Create default model configuration
    const modelConfigPath = path.join(this.projectRoot, 'src/ai/modelConfig.json')
    const defaultConfig = {
      modelId: 'gpt-4o',
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      trainingDataSize: 0,
      accuracy: 0.0,
      status: 'initializing'
    }

    fs.writeFileSync(modelConfigPath, JSON.stringify(defaultConfig, null, 2))
    console.log('✅ AI configuration created')

    // Create active model file
    const activeModelPath = path.join(this.projectRoot, 'src/ai/activeModel.json')
    const activeConfig = {
      modelId: 'gpt-4o',
      deployedAt: new Date().toISOString(),
      version: '1.0.0',
      status: 'active'
    }

    fs.writeFileSync(activeModelPath, JSON.stringify(activeConfig, null, 2))
    console.log('✅ Active model configuration created')
  }

  async runInitialScraping() {
    console.log('\n📊 Running initial data scraping...')

    const answer = await this.question('Run initial data scraping now? This may take several minutes. (y/N): ')
    
    if (answer.toLowerCase() === 'y') {
      try {
        console.log('Starting data scraping...')
        execSync('npm run scrape-data', { 
          cwd: this.projectRoot, 
          stdio: 'inherit' 
        })
        console.log('✅ Initial data scraping completed')
      } catch (error) {
        console.warn('⚠️  Initial scraping failed, you can run it later with: npm run scrape-data')
      }
    } else {
      console.log('Skipping initial scraping. Run "npm run scrape-data" later.')
    }
  }

  async finalizeSetup() {
    console.log('\n🎯 Finalizing setup...')

    // Create a setup completion marker
    const setupMarkerPath = path.join(this.projectRoot, '.setup-complete')
    fs.writeFileSync(setupMarkerPath, new Date().toISOString())

    // Update package.json scripts if needed
    const packagePath = path.join(this.projectRoot, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

    // Ensure all required scripts are present
    const requiredScripts = {
      'scrape-data': 'node src/scripts/scrapePokerData.js',
      'train-model': 'node src/scripts/trainModel.js',
      'update-model': 'node src/scripts/updateModel.js'
    }

    let updated = false
    for (const [script, command] of Object.entries(requiredScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command
        updated = true
      }
    }

    if (updated) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
      console.log('✅ Package.json scripts updated')
    }

    console.log('✅ Setup finalized')
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve)
    })
  }
}

// Run the setup wizard
const wizard = new SetupWizard()
wizard.run().catch(console.error)