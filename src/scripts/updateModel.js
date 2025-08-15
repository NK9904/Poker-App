import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { PokerDataScraper } from './scrapePokerData.js';
import { ModelTrainer } from './trainModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ModelUpdater {
  constructor() {
    this.scraper = new PokerDataScraper();
    this.trainer = new ModelTrainer();
    this.updateInterval = '0 2 * * *'; // Daily at 2 AM
    this.isUpdating = false;
  }

  async initialize() {
    console.log('Initializing model updater...');

    await this.scraper.initialize();
    await this.trainer.initialize();

    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  async performFullUpdate() {
    if (this.isUpdating) {
      console.log('Update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
    console.log('Starting full model update...');

    try {
      // Step 1: Scrape latest data
      console.log('Step 1: Scraping latest poker data...');
      await this.scrapeLatestData();

      // Step 2: Check if we have enough new data
      console.log('Step 2: Checking data requirements...');
      const hasEnoughData = await this.checkDataRequirements();

      if (!hasEnoughData) {
        console.log('Not enough new data for model update, skipping...');
        return;
      }

      // Step 3: Train model with new data
      console.log('Step 3: Training model with new data...');
      await this.trainWithNewData();

      // Step 4: Validate and deploy new model
      console.log('Step 4: Validating and deploying new model...');
      await this.validateAndDeploy();

      console.log('Model update completed successfully!');
    } catch (error) {
      console.error('Model update failed:', error);
      await this.logUpdateError(error);
    } finally {
      this.isUpdating = false;
    }
  }

  async scrapeLatestData() {
    try {
      await this.scraper.scrapeAllSources();
      await this.scraper.exportTrainingData();

      const stats = await this.scraper.getScrapingStats();
      console.log('Latest scraping stats:', stats);
    } catch (error) {
      console.error('Data scraping failed:', error);
      throw error;
    }
  }

  async checkDataRequirements() {
    try {
      const stats = await this.scraper.getScrapingStats();
      const lastUpdate = await this.getLastUpdateTime();

      // Check if we have at least 1000 new hands since last update
      const newHandsThreshold = 1000;
      const timeSinceUpdate = Date.now() - lastUpdate;
      const minTimeBetweenUpdates = 24 * 60 * 60 * 1000; // 24 hours

      if (stats.total_hands < newHandsThreshold) {
        console.log(
          `Only ${stats.total_hands} total hands, need at least ${newHandsThreshold}`
        );
        return false;
      }

      if (timeSinceUpdate < minTimeBetweenUpdates) {
        console.log('Not enough time since last update');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking data requirements:', error);
      return false;
    }
  }

  async trainWithNewData() {
    try {
      // Load training data
      const hands = await this.trainer.loadTrainingData();

      // Prepare training examples
      const trainingExamples = await this.trainer.prepareTrainingData(hands);

      // Fine-tune model
      const jobId = await this.trainer.fineTuneModel(trainingExamples);

      // Monitor fine-tuning
      const modelId = await this.trainer.monitorFineTuning(jobId);

      // Validate model
      const validation = await this.trainer.validateModel(
        modelId,
        trainingExamples.slice(0, 100)
      );

      // Check if new model is better than current
      const currentAccuracy = await this.getCurrentModelAccuracy();

      if (validation.accuracy > currentAccuracy) {
        console.log(
          `New model accuracy (${validation.accuracy}) is better than current (${currentAccuracy})`
        );
        await this.trainer.updateModelConfiguration(modelId);
        await this.logSuccessfulUpdate(modelId, validation.accuracy);
      } else {
        console.log(
          `New model accuracy (${validation.accuracy}) is not better than current (${currentAccuracy}), keeping current model`
        );
      }
    } catch (error) {
      console.error('Model training failed:', error);
      throw error;
    }
  }

  async validateAndDeploy() {
    try {
      const configPath = path.join(__dirname, '../ai/modelConfig.json');

      if (!fs.existsSync(configPath)) {
        console.log('No model configuration found, skipping deployment');
        return;
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      // Perform additional validation
      const validationResult = await this.performDeploymentValidation(
        config.modelId
      );

      if (validationResult.success) {
        console.log('Model validation passed, deploying...');
        await this.deployModel(config.modelId);
      } else {
        console.log('Model validation failed:', validationResult.error);
        throw new Error('Model validation failed');
      }
    } catch (error) {
      console.error('Validation and deployment failed:', error);
      throw error;
    }
  }

  async performDeploymentValidation(modelId) {
    try {
      // Test the model with a set of known scenarios
      const testScenarios = [
        {
          playerCards: [
            { rank: 'A', suit: 'h' },
            { rank: 'K', suit: 'h' },
          ],
          boardCards: [
            { rank: 'Q', suit: 'h' },
            { rank: 'J', suit: 'h' },
            { rank: 'T', suit: 'h' },
          ],
          expectedAction: 'raise',
        },
        {
          playerCards: [
            { rank: '2', suit: 'c' },
            { rank: '7', suit: 'd' },
          ],
          boardCards: [
            { rank: 'A', suit: 'h' },
            { rank: 'K', suit: 's' },
            { rank: 'Q', suit: 'd' },
          ],
          expectedAction: 'fold',
        },
      ];

      let correctPredictions = 0;

      for (const scenario of testScenarios) {
        try {
          const response = await this.trainer.callFineTunedModel(
            modelId,
            this.buildTestPrompt(scenario)
          );

          if (response.toLowerCase().includes(scenario.expectedAction)) {
            correctPredictions++;
          }
        } catch (error) {
          console.error('Test scenario failed:', error);
        }
      }

      const accuracy = correctPredictions / testScenarios.length;
      const success = accuracy >= 0.8; // 80% accuracy threshold

      return {
        success,
        accuracy,
        error: success ? null : `Accuracy ${accuracy} below threshold 0.8`,
      };
    } catch (error) {
      return {
        success: false,
        accuracy: 0,
        error: error.message,
      };
    }
  }

  buildTestPrompt(scenario) {
    return `Analyze this poker situation and provide the optimal action:

Game Context:
- Player Cards: ${scenario.playerCards.map(c => `${c.rank}${c.suit}`).join(' ')}
- Board Cards: ${scenario.boardCards.map(c => `${c.rank}${c.suit}`).join(' ')}
- Pot Size: $100
- Stack Size: $1000
- Position: middle

Based on professional poker data, what is the optimal action in this situation?`;
  }

  async deployModel(modelId) {
    try {
      // Update the active model configuration
      const configPath = path.join(__dirname, '../ai/activeModel.json');
      const config = {
        modelId,
        deployedAt: new Date().toISOString(),
        version: '2.0.0',
        status: 'active',
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`Model ${modelId} deployed successfully`);
    } catch (error) {
      console.error('Model deployment failed:', error);
      throw error;
    }
  }

  async getLastUpdateTime() {
    try {
      const configPath = path.join(__dirname, '../ai/modelConfig.json');

      if (!fs.existsSync(configPath)) {
        return 0;
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return new Date(config.lastUpdated).getTime();
    } catch (error) {
      console.error('Error getting last update time:', error);
      return 0;
    }
  }

  async getCurrentModelAccuracy() {
    try {
      const configPath = path.join(__dirname, '../ai/modelConfig.json');

      if (!fs.existsSync(configPath)) {
        return 0;
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config.accuracy || 0;
    } catch (error) {
      console.error('Error getting current model accuracy:', error);
      return 0;
    }
  }

  async logSuccessfulUpdate(modelId, accuracy) {
    try {
      const logPath = path.join(__dirname, '../../data/update_log.json');
      const logEntry = {
        timestamp: new Date().toISOString(),
        modelId,
        accuracy,
        status: 'success',
        type: 'model_update',
      };

      let logs = [];
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }

      logs.push(logEntry);
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error logging successful update:', error);
    }
  }

  async logUpdateError(error) {
    try {
      const logPath = path.join(__dirname, '../../data/update_log.json');
      const logEntry = {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: 'error',
        type: 'model_update',
      };

      let logs = [];
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      }

      logs.push(logEntry);
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
    } catch (logError) {
      console.error('Error logging update error:', logError);
    }
  }

  startScheduledUpdates() {
    console.log(`Starting scheduled model updates (${this.updateInterval})...`);

    cron.schedule(this.updateInterval, async () => {
      console.log('Running scheduled model update...');
      await this.performFullUpdate();
    });
  }

  async cleanup() {
    await this.scraper.cleanup();
    await this.trainer.cleanup();
  }
}

// Main execution
async function main() {
  const updater = new ModelUpdater();

  try {
    await updater.initialize();

    // Check if running in scheduled mode or immediate mode
    const args = process.argv.slice(2);

    if (args.includes('--scheduled')) {
      updater.startScheduledUpdates();
      console.log(
        'Model updater running in scheduled mode. Press Ctrl+C to stop.'
      );

      // Keep the process running
      process.on('SIGINT', async () => {
        console.log('Stopping model updater...');
        await updater.cleanup();
        process.exit(0);
      });
    } else {
      // Run immediate update
      await updater.performFullUpdate();
    }
  } catch (error) {
    console.error('Model updater failed:', error);
    process.exit(1);
  } finally {
    await updater.cleanup();
  }
}

// Export for use in other modules
export { ModelUpdater };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
