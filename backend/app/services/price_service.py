import requests
from typing import Optional, Dict
from datetime import datetime

class PriceService:
    """Service to fetch Pokemon card prices from PokemonTCG.io API"""
    
    BASE_URL = "https://api.pokemontcg.io/v2"
    
    @staticmethod
    def fetch_card_price(card_name: str, set_name: str = None) -> Optional[Dict]:
        """
        Fetch price data for a Pokemon card
        
        Args:
            card_name: Name of the card
            set_name: Optional set name for more accurate matching
            
        Returns:
            Dict with market_price, low_price, high_price, or None if not found
        """
        try:
            # Build search query
            query = f'name:"{card_name}"'
            if set_name and set_name != "Unknown":
                query += f' set.name:"{set_name}"'
            
            # Make API request
            response = requests.get(
                f"{PriceService.BASE_URL}/cards",
                params={"q": query, "select": "id,name,set,tcgplayer"},
                timeout=10
            )
            
            if response.status_code != 200:
                print(f"API Error: {response.status_code}")
                return None
            
            data = response.json()
            
            if not data.get("data"):
                print(f"No cards found for: {card_name}")
                return None
            
            # Get the first matching card
            card = data["data"][0]
            
            # Extract TCGPlayer prices
            tcgplayer = card.get("tcgplayer", {})
            prices = tcgplayer.get("prices", {})
            
            # Try different price categories (normal, holofoil, reverseHolofoil, etc.)
            price_data = None
            for category in ["holofoil", "normal", "reverseHolofoil", "1stEditionHolofoil"]:
                if category in prices:
                    price_data = prices[category]
                    break
            
            if not price_data:
                print(f"No price data available for: {card_name}")
                return None
            
            return {
                "market_price": price_data.get("market"),
                "low_price": price_data.get("low"),
                "high_price": price_data.get("high"),
                "last_price_update": datetime.utcnow()
            }
            
        except requests.RequestException as e:
            print(f"Network error fetching price: {e}")
            return None
        except Exception as e:
            print(f"Error fetching price: {e}")
            return None