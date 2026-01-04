const API_URL = 'https://pokemarketai-backend.onrender.com';

export interface Card {
  id?: number;
  card_name: string;
  set_name?: string;
  card_number?: string;
  rarity?: string;
  condition?: string;
  confidence?: string;
  image_url?: string;
  current_price?: number;
  
  // NEW: Price fields
  market_price?: number;
  low_price?: number;
  high_price?: number;
  last_price_update?: string;
  
  created_at?: string;
  updated_at?: string;
}

// NEW: Price History Interface
export interface PriceHistory {
  card_id: number;
  card_name: string;
  set_name: string;
  current_price: number;
  price_history: any;
  trend_analysis: {
    trend: string;
    week_change_percent: number;
    lowest_price: number;
    highest_price: number;
    average_price: number;
    total_data_points: number;
  };
  last_updated: string;
  message?: string;
}

export interface AIInsights {
  card_id: number;
  card_name: string;
  set_name: string;
  current_price: number;
  ai_insights: {
    prediction: string;
    recommendation: 'BUY' | 'HOLD' | 'SELL';
    reasoning: string;
    confidence: number;
    generated_at: string;
  };
  trend_analysis: {
    trend: string;
    week_change_percent: number;
    lowest_price: number;
    highest_price: number;
    average_price: number;
    total_data_points: number;
  };
  message?: string;
}

export async function saveCard(card: Card): Promise<Card> {
  try {
    const response = await fetch(`${API_URL}/cards/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_name: card.card_name,
        set_name: card.set_name || 'Unknown',
        card_number: card.card_number || 'Unknown',
        rarity: card.rarity || 'Unknown',
        condition: card.condition || 'Unknown',
        confidence: card.confidence || 'Low',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save card: ${response.status}`);
    }

    const savedCard = await response.json();
    return savedCard;
  } catch (error) {
    console.error('Error saving card:', error);
    throw error;
  }
}

export async function getAllCards(): Promise<Card[]> {
  try {
    const response = await fetch(`${API_URL}/cards/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cards: ${response.status}`);
    }

    const cards = await response.json();
    return cards;
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
}

export async function deleteCard(cardId: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete card: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
}

export async function getCardPriceHistory(cardId: number): Promise<PriceHistory> {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}/price-history`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price history: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw error;
  }
}

export async function getCardAIInsights(cardId: number): Promise<AIInsights> {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}/ai-insights`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch AI insights: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    throw error;
  }
}