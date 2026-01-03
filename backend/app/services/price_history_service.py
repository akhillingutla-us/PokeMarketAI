import requests
from typing import Optional, Dict, List
from datetime import datetime
import os

class PriceHistoryService:
    """Service to fetch historical price data from PokemonPriceTracker API"""
    
    BASE_URL = "https://www.pokemonpricetracker.com/api/v2"
    
    @staticmethod
    def get_api_key() -> str:
        """Get API key from environment"""
        return os.getenv('POKEMON_PRICE_TRACKER_API_KEY', '')
    
    @staticmethod
    def get_price_history(card_name: str, set_name: str = None, days: int = 90) -> Optional[Dict]:
        """
        Get price history for a card (up to 90 days)
        
        Returns:
            Dict with card info and price history, or None if not found
        """
        try:
            api_key = PriceHistoryService.get_api_key()
            if not api_key:
                print("No PokemonPriceTracker API key found")
                return None
            
            # Build search params - include history
            params = {
                'name': card_name,
                'limit': 1,
                'includeHistory': 'true'  # IMPORTANT: Request price history
            }
            
            if set_name and set_name != "Unknown":
                params['setName'] = set_name
            
            print(f"Requesting price history with params: {params}")
            
            response = requests.get(
                f"{PriceHistoryService.BASE_URL}/cards",
                headers={'Authorization': f'Bearer {api_key}'},
                params=params,
                timeout=20
            )
            
            print(f"API Response Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"API Error {response.status_code}: {response.text}")
                return None
            
            data = response.json()
            
            if not data.get('data') or len(data['data']) == 0:
                print(f"No cards found for: {card_name}")
                return None
            
            card_data = data['data'][0]
            print(f"Found card: {card_data.get('name')}")
            
            # Extract price history
            price_history = card_data.get('priceHistory', {})
            
            if not price_history:
                print(f"No price history in response")
                return None
            
            # Format the response
            return {
                'card_id': card_data.get('tcgPlayerId') or card_data.get('id'),
                'card_name': card_data.get('name'),
                'set_name': card_data.get('setName'),
                'current_price': card_data.get('prices', {}).get('market'),
                'price_history': price_history,
                'last_updated': datetime.utcnow()
            }
            
        except Exception as e:
            print(f"Error fetching price history: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    @staticmethod
    def analyze_trend(price_history: Dict) -> Dict:
        """
        Analyze price trends from historical data
        
        Returns:
            Dict with trend analysis (change %, volatility, etc.)
        """
        try:
            if not price_history:
                return {}
            
            # Get prices as list
            prices = list(price_history.values())
            if len(prices) < 2:
                return {}
            
            # Calculate metrics
            current_price = prices[-1]
            week_ago = prices[-7] if len(prices) >= 7 else prices[0]
            month_ago = prices[-30] if len(prices) >= 30 else prices[0]
            
            week_change = ((current_price - week_ago) / week_ago * 100) if week_ago > 0 else 0
            month_change = ((current_price - month_ago) / month_ago * 100) if month_ago > 0 else 0
            
            # Determine trend
            if month_change > 10:
                trend = "Strong Upward"
            elif month_change > 5:
                trend = "Upward"
            elif month_change < -10:
                trend = "Strong Downward"
            elif month_change < -5:
                trend = "Downward"
            else:
                trend = "Stable"
            
            return {
                'trend': trend,
                'week_change_percent': round(week_change, 2),
                'month_change_percent': round(month_change, 2),
                'lowest_price': min(prices),
                'highest_price': max(prices),
                'average_price': round(sum(prices) / len(prices), 2)
            }
            
        except Exception as e:
            print(f"Error analyzing trend: {e}")
            return {}