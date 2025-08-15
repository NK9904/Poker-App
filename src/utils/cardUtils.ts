import type { Card } from '../types/poker'
import { SUIT_SYMBOLS, SUIT_COLORS, CARD_RANKS, CARD_SUITS } from '../constants/poker'

/**
 * Utility functions for card operations
 */
export class CardUtils {
  /**
   * Generate all possible card combinations
   */
  static generateAllCards(): string[] {
    const cards: string[] = []
    for (const rank of CARD_RANKS) {
      for (const suit of CARD_SUITS) {
        cards.push(rank + suit)
      }
    }
    return cards
  }

  /**
   * Convert card string to Card object
   */
  static stringToCard(cardString: string): Card | null {
    if (!cardString || cardString.length !== 2) return null
    
    const [rank, suit] = cardString.split('')
    
    if (!CARD_RANKS.includes(rank as any) || !CARD_SUITS.includes(suit as any)) {
      return null
    }
    
    return {
      rank: rank as Card['rank'],
      suit: suit as Card['suit']
    }
  }

  /**
   * Convert Card object to string
   */
  static cardToString(card: Card): string {
    return `${card.rank}${card.suit}`
  }

  /**
   * Check if a card is already selected in a list
   */
  static isCardSelected(card: Card, selectedCards: Card[]): boolean {
    return selectedCards.some(selected => 
      selected.rank === card.rank && selected.suit === card.suit
    )
  }

  /**
   * Get card display properties
   */
  static getCardDisplay(card: Card) {
    return {
      symbol: SUIT_SYMBOLS[card.suit],
      color: SUIT_COLORS[card.suit],
      display: `${card.rank}${SUIT_SYMBOLS[card.suit]}`
    }
  }

  /**
   * Validate card selection limits
   */
  static canSelectCard(
    card: Card, 
    currentCards: Card[], 
    allSelectedCards: Card[], 
    maxCards: number
  ): boolean {
    if (currentCards.length >= maxCards) return false
    if (this.isCardSelected(card, allSelectedCards)) return false
    return true
  }

  /**
   * Fisher-Yates shuffle for deck operations
   */
  static shuffleDeck(cards: string[]): string[] {
    const deck = [...cards]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    return deck
  }
}