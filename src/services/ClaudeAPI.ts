import { ANTHROPIC_API_KEY } from '@env';

export interface CardIdentification {
  cardName: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  condition: string;
  confidence: string;
}

export async function identifyCard(imageBase64: string): Promise<CardIdentification> {
  try {
    // Debug: Check if API key exists
    console.log('API Key exists:', !!ANTHROPIC_API_KEY);
    console.log('API Key length:', ANTHROPIC_API_KEY?.length || 0);
    console.log('Image base64 length:', imageBase64?.length || 0);

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not defined. Check your .env file.');
    }

    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `You are an expert at identifying Pokémon TCG cards. Analyze this card image carefully and extract ALL visible information.

IMPORTANT: Look for these specific details:
- Card name (usually at the top)
- Set name and symbol (usually at bottom right or left)  
- Card number (format: XX/XXX at bottom)
- Rarity symbol (circle=common, diamond=uncommon, star=rare, star+holo=holo rare)
- Condition based on visible wear, edges, corners

Respond ONLY with valid JSON in this exact format:

{
  "cardName": "exact card name",
  "setName": "set name or Unknown", 
  "cardNumber": "XX/XXX or Unknown",
  "rarity": "Common/Uncommon/Rare/Holo Rare/Ultra Rare",
  "condition": "Mint/Near Mint/Lightly Played/Moderately Played/Heavily Played",
  "confidence": "High/Medium/Low"
}

Use "Unknown" only if you truly cannot see the information in the image.`,
              },
            ],
          },
        ],
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    // Parse Claude's response
    const responseText = data.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const cardData = JSON.parse(jsonMatch[0]);
      return cardData;
    }
    
    throw new Error('Could not parse card data from response');
  } catch (error) {
    console.error('Error identifying card:', error);
    throw error;
  }
}