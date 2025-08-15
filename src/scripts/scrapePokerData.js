import puppeteer from 'puppeteer'
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cron from 'node-cron'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import csv from 'csv-parser'
import createCsvWriter from 'csv-writer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class PokerDataScraper {
  constructor() {
    this.db = null
    this.browser = null
    this.dataSources = [
      {
        name: 'PokerStars',
        url: 'https://www.pokerstars.com/en/poker/tournaments/',
        type: 'tournament'
      },
      {
        name: 'WSOP',
        url: 'https://www.wsop.com/tournaments/',
        type: 'tournament'
      },
      {
        name: 'PokerNews',
        url: 'https://www.pokernews.com/live-reporting/',
        type: 'live'
      },
      {
        name: 'HendonMob',
        url: 'https://pokerdb.thehendonmob.com/',
        type: 'player'
      },
      {
        name: 'PokerTracker',
        url: 'https://www.pokertracker.com/',
        type: 'stats'
      }
    ]
  }

  async initialize() {
    // Initialize database
    this.db = await open({
      filename: path.join(__dirname, '../../data/poker_data.db'),
      driver: sqlite3.Database
    })

    // Create tables
    await this.createTables()

    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async createTables() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS hand_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_name TEXT,
        player_name TEXT,
        player_cards TEXT,
        board_cards TEXT,
        pot_size INTEGER,
        stack_size INTEGER,
        position TEXT,
        action TEXT,
        bet_size INTEGER,
        result TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        source TEXT
      )
    `)

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS player_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT UNIQUE,
        total_hands INTEGER DEFAULT 0,
        win_rate REAL DEFAULT 0,
        avg_bet_size REAL DEFAULT 0,
        vpip REAL DEFAULT 0,
        pfr REAL DEFAULT 0,
        af REAL DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS scraping_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT,
        status TEXT,
        records_scraped INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT
      )
    `)
  }

  async scrapeAllSources() {
    console.log('Starting comprehensive poker data scraping...')
    
    for (const source of this.dataSources) {
      try {
        console.log(`Scraping ${source.name}...`)
        await this.scrapeSource(source)
        await this.logScraping(source.name, 'success', 0)
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error.message)
        await this.logScraping(source.name, 'error', 0, error.message)
      }
    }
  }

  async scrapeSource(source) {
    const page = await this.browser.newPage()
    
    try {
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 })
      
      switch (source.type) {
        case 'tournament':
          await this.scrapeTournamentData(page, source)
          break
        case 'live':
          await this.scrapeLiveData(page, source)
          break
        case 'player':
          await this.scrapePlayerData(page, source)
          break
        case 'stats':
          await this.scrapeStatsData(page, source)
          break
      }
    } finally {
      await page.close()
    }
  }

  async scrapeTournamentData(page, source) {
    // Scrape tournament hand histories
    const hands = await page.evaluate(() => {
      const handElements = document.querySelectorAll('.hand-history, .tournament-hand')
      return Array.from(handElements).map(element => {
        // Extract hand data from tournament pages
        const playerCards = element.querySelector('.player-cards')?.textContent || ''
        const boardCards = element.querySelector('.board-cards')?.textContent || ''
        const potSize = parseInt(element.querySelector('.pot-size')?.textContent?.replace(/[^0-9]/g, '') || '0')
        const action = element.querySelector('.action')?.textContent || ''
        const playerName = element.querySelector('.player-name')?.textContent || ''
        
        return {
          playerCards,
          boardCards,
          potSize,
          action,
          playerName
        }
      })
    })

    // Save to database
    for (const hand of hands) {
      await this.saveHandData({
        tournament_name: source.name,
        player_name: hand.playerName,
        player_cards: hand.playerCards,
        board_cards: hand.boardCards,
        pot_size: hand.potSize,
        action: hand.action,
        source: source.name
      })
    }
  }

  async scrapeLiveData(page, source) {
    // Scrape live poker data
    const liveData = await page.evaluate(() => {
      const liveElements = document.querySelectorAll('.live-hand, .live-action')
      return Array.from(liveElements).map(element => {
        const playerCards = element.querySelector('.cards')?.textContent || ''
        const boardCards = element.querySelector('.community-cards')?.textContent || ''
        const potSize = parseInt(element.querySelector('.pot')?.textContent?.replace(/[^0-9]/g, '') || '0')
        const action = element.querySelector('.player-action')?.textContent || ''
        const playerName = element.querySelector('.player')?.textContent || ''
        
        return {
          playerCards,
          boardCards,
          potSize,
          action,
          playerName
        }
      })
    })

    for (const data of liveData) {
      await this.saveHandData({
        tournament_name: 'Live Game',
        player_name: data.playerName,
        player_cards: data.playerCards,
        board_cards: data.boardCards,
        pot_size: data.potSize,
        action: data.action,
        source: source.name
      })
    }
  }

  async scrapePlayerData(page, source) {
    // Scrape player statistics and profiles
    const players = await page.evaluate(() => {
      const playerElements = document.querySelectorAll('.player-profile, .player-stats')
      return Array.from(playerElements).map(element => {
        const playerName = element.querySelector('.name')?.textContent || ''
        const totalHands = parseInt(element.querySelector('.hands')?.textContent?.replace(/[^0-9]/g, '') || '0')
        const winRate = parseFloat(element.querySelector('.win-rate')?.textContent?.replace(/[^0-9.]/g, '') || '0')
        const avgBetSize = parseFloat(element.querySelector('.avg-bet')?.textContent?.replace(/[^0-9.]/g, '') || '0')
        
        return {
          playerName,
          totalHands,
          winRate,
          avgBetSize
        }
      })
    })

    for (const player of players) {
      await this.savePlayerStats(player)
    }
  }

  async scrapeStatsData(page, source) {
    // Scrape advanced statistics
    const stats = await page.evaluate(() => {
      const statElements = document.querySelectorAll('.stat-row, .metric')
      return Array.from(statElements).map(element => {
        const playerName = element.querySelector('.player')?.textContent || ''
        const vpip = parseFloat(element.querySelector('.vpip')?.textContent?.replace(/[^0-9.]/g, '') || '0')
        const pfr = parseFloat(element.querySelector('.pfr')?.textContent?.replace(/[^0-9.]/g, '') || '0')
        const af = parseFloat(element.querySelector('.af')?.textContent?.replace(/[^0-9.]/g, '') || '0')
        
        return {
          playerName,
          vpip,
          pfr,
          af
        }
      })
    })

    for (const stat of stats) {
      await this.updatePlayerStats(stat)
    }
  }

  async saveHandData(handData) {
    try {
      await this.db.run(`
        INSERT INTO hand_data 
        (tournament_name, player_name, player_cards, board_cards, pot_size, action, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        handData.tournament_name,
        handData.player_name,
        handData.player_cards,
        handData.board_cards,
        handData.pot_size,
        handData.action,
        handData.source
      ])
    } catch (error) {
      console.error('Error saving hand data:', error)
    }
  }

  async savePlayerStats(playerStats) {
    try {
      await this.db.run(`
        INSERT OR REPLACE INTO player_stats 
        (player_name, total_hands, win_rate, avg_bet_size, last_updated)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        playerStats.playerName,
        playerStats.totalHands,
        playerStats.winRate,
        playerStats.avgBetSize
      ])
    } catch (error) {
      console.error('Error saving player stats:', error)
    }
  }

  async updatePlayerStats(stats) {
    try {
      await this.db.run(`
        UPDATE player_stats 
        SET vpip = ?, pfr = ?, af = ?, last_updated = CURRENT_TIMESTAMP
        WHERE player_name = ?
      `, [stats.vpip, stats.pfr, stats.af, stats.playerName])
    } catch (error) {
      console.error('Error updating player stats:', error)
    }
  }

  async logScraping(source, status, recordsScraped, errorMessage = null) {
    try {
      await this.db.run(`
        INSERT INTO scraping_log (source, status, records_scraped, error_message)
        VALUES (?, ?, ?, ?)
      `, [source, status, recordsScraped, errorMessage])
    } catch (error) {
      console.error('Error logging scraping:', error)
    }
  }

  async exportTrainingData() {
    console.log('Exporting training data for AI model...')
    
    const hands = await this.db.all(`
      SELECT * FROM hand_data 
      WHERE player_cards IS NOT NULL 
      AND player_cards != ''
      ORDER BY timestamp DESC
      LIMIT 10000
    `)

    const trainingData = hands.map(hand => ({
      gameState: {
        playerCards: this.parseCards(hand.player_cards),
        boardCards: this.parseCards(hand.board_cards),
        potSize: hand.pot_size,
        stackSize: 1000, // Default stack size
        position: 'middle', // Default position
        actionHistory: []
      },
      optimalAction: {
        action: hand.action,
        sizing: 0,
        expectedValue: 0,
        reasoning: `Action from ${hand.source}`
      },
      expectedValue: 0,
      confidence: 0.8
    }))

    // Export to CSV
    const csvWriter = createCsvWriter({
      path: path.join(__dirname, '../../data/training_data.csv'),
      header: [
        { id: 'playerCards', title: 'Player Cards' },
        { id: 'boardCards', title: 'Board Cards' },
        { id: 'potSize', title: 'Pot Size' },
        { id: 'action', title: 'Action' },
        { id: 'source', title: 'Source' }
      ]
    })

    await csvWriter.writeRecords(hands.map(h => ({
      playerCards: h.player_cards,
      boardCards: h.board_cards,
      potSize: h.pot_size,
      action: h.action,
      source: h.source
    })))

    console.log(`Exported ${trainingData.length} training examples`)
    return trainingData
  }

  parseCards(cardString) {
    if (!cardString) return []
    
    // Parse card strings like "Ah Kd" or "A♠ K♦"
    const cards = cardString.split(/\s+/).filter(c => c.length >= 2)
    return cards.map(card => {
      const rank = card[0]
      const suit = card[1]
      return { rank, suit }
    })
  }

  async getScrapingStats() {
    const stats = await this.db.get(`
      SELECT 
        COUNT(*) as total_hands,
        COUNT(DISTINCT player_name) as unique_players,
        COUNT(DISTINCT source) as sources_scraped,
        MAX(timestamp) as last_scraped
      FROM hand_data
    `)

    return stats
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
    if (this.db) {
      await this.db.close()
    }
  }
}

// Main execution
async function main() {
  const scraper = new PokerDataScraper()
  
  try {
    await scraper.initialize()
    await scraper.scrapeAllSources()
    await scraper.exportTrainingData()
    
    const stats = await scraper.getScrapingStats()
    console.log('Scraping completed:', stats)
    
  } catch (error) {
    console.error('Scraping failed:', error)
  } finally {
    await scraper.cleanup()
  }
}

// Schedule regular scraping
function scheduleScraping() {
  // Run scraping every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled poker data scraping...')
    await main()
  })
}

// Export for use in other modules
export { PokerDataScraper }

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}