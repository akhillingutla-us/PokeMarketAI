import os
import json
from typing import Optional, Dict
from anthropic import Anthropic

class AIInsightsService:
    """Service to generate AI-powered insights using Claude API"""
    
    @staticmethod
    def get_api_key() -> str:
        """Get Anthropic API key from environment"""
        return os.getenv('ANTHROPIC_API_KEY', '')
    
    @staticmethod
    def generate_insights(card_name: str, set_name: str, current_price: float, 
                         trend_analysis: Dict, price_history: Dict) -> Optional[Dict]:
        """
        Generate AI-powered insights for a card using Claude
        
        Args:
            card_name: Name of the card
            set_name: Set the card is from
            current_price: Current market price
            trend_analysis: Trend analysis data
            price_history: Historical price data
            
        Returns:
            Dict with prediction, recommendation, and reasoning
        """
        try:
            api_key = AIInsightsService.get_api_key()
            if not api_key:
                print("No Anthropic API key found")
                return None
            
            client = Anthropic(api_key=api_key)
            
            # Prepare the prompt
            prompt = f"""You are an expert Pokémon TCG market analyst. Analyze this card's price data and provide investment insights.

Card: {card_name} ({set_name})
Current Price: ${current_price:.2f}

Price Trend Analysis:
- Trend: {trend_analysis.get('trend', 'Unknown')}
- Week Change: {trend_analysis.get('week_change_percent', 0):.2f}%
- Average Price: ${trend_analysis.get('average_price', 0):.2f}
- Price Range: ${trend_analysis.get('lowest_price', 0):.2f} - ${trend_analysis.get('highest_price', 0):.2f}
- Data Points: {trend_analysis.get('total_data_points', 0)} days

Based on this data, provide:

1. **Prediction** (1-2 sentences): Short-term price outlook
2. **Recommendation** (one word): BUY, HOLD, or SELL
3. **Reasoning** (2-3 sentences): Why you recommend this action
4. **Confidence** (percentage): How confident are you in this analysis

Format your response as JSON:
{{
  "prediction": "...",
  "recommendation": "BUY|HOLD|SELL",
  "reasoning": "...",
  "confidence": 85
}}"""

            # Call Claude API
            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Parse response
            response_text = message.content[0].text
            
            # Extract JSON from response (handle markdown code blocks)
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            insights = json.loads(response_text)
            
            return {
                "prediction": insights.get("prediction", ""),
                "recommendation": insights.get("recommendation", "HOLD"),
                "reasoning": insights.get("reasoning", ""),
                "confidence": insights.get("confidence", 50),
                "generated_at": "now"
            }
            
        except Exception as e:
            print(f"Error generating AI insights: {e}")
            import traceback
            traceback.print_exc()
            return None