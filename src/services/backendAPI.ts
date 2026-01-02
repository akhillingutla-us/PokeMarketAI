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
  created_at?: string;
  updated_at?: string;
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
