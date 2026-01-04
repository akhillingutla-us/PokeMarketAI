from sqlalchemy.orm import Session
from app.models.card import Card
from app.models.price_history import PriceHistory
from app.services.price_service import PriceService
from datetime import datetime, timedelta
from typing import List, Dict

class SnapshotService:
    """Service to capture daily price snapshots"""
    
    @staticmethod
    def capture_snapshot(db: Session, card_id: int) -> PriceHistory:
        """
        Capture a price snapshot for a single card
        """
        # Get card
        card = db.query(Card).filter(Card.id == card_id).first()
        if not card:
            return None
        
        # Check if we already have a snapshot today
        today = datetime.utcnow().date()
        existing = db.query(PriceHistory).filter(
            PriceHistory.card_id == card_id,
            PriceHistory.snapshot_date >= datetime.combine(today, datetime.min.time())
        ).first()
        
        if existing:
            print(f"Snapshot already exists for card {card_id} today")
            return existing
        
        # Fetch current prices
        price_data = PriceService.fetch_card_price(card.card_name, card.set_name)
        
        if not price_data:
            print(f"No price data for card {card_id}")
            return None
        
        # Create snapshot
        snapshot = PriceHistory(
            card_id=card_id,
            market_price=price_data.get("market_price"),
            low_price=price_data.get("low_price"),
            high_price=price_data.get("high_price"),
            condition="Near Mint"
        )
        
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        
        print(f"✓ Snapshot created for {card.card_name}: ${snapshot.market_price}")
        return snapshot
    
    @staticmethod
    def capture_all_snapshots(db: Session) -> Dict:
        """
        Capture price snapshots for ALL cards in the database
        """
        cards = db.query(Card).all()
        
        results = {
            "total_cards": len(cards),
            "successful": 0,
            "skipped": 0,
            "failed": 0,
            "snapshots": []
        }
        
        for card in cards:
            try:
                snapshot = SnapshotService.capture_snapshot(db, card.id)
                if snapshot:
                    results["successful"] += 1
                    results["snapshots"].append({
                        "card_id": card.id,
                        "card_name": card.card_name,
                        "price": snapshot.market_price
                    })
                else:
                    results["skipped"] += 1
            except Exception as e:
                print(f"Error capturing snapshot for card {card.id}: {e}")
                results["failed"] += 1
        
        return results
    
    @staticmethod
    def get_card_history(db: Session, card_id: int, days: int = 90) -> List[PriceHistory]:
        """
        Get price history for a card over the last N days
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        history = db.query(PriceHistory).filter(
            PriceHistory.card_id == card_id,
            PriceHistory.snapshot_date >= cutoff_date
        ).order_by(PriceHistory.snapshot_date.asc()).all()
        
        return history