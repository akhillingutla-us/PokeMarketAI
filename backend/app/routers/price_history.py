from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.config import get_db
from app.models.price_history import PriceHistory
from app.schemas.price_history import PriceHistoryResponse
from app.services.snapshot_service import SnapshotService

router = APIRouter(prefix="/price-history", tags=["price-history"])

@router.post("/snapshot/{card_id}")
def capture_card_snapshot(card_id: int, db: Session = Depends(get_db)):
    """Capture a price snapshot for a specific card"""
    snapshot = SnapshotService.capture_snapshot(db, card_id)
    
    if not snapshot:
        raise HTTPException(status_code=404, detail="Failed to capture snapshot")
    
    return {
        "message": "Snapshot captured successfully",
        "snapshot": {
            "card_id": snapshot.card_id,
            "market_price": snapshot.market_price,
            "snapshot_date": snapshot.snapshot_date
        }
    }

@router.post("/snapshot-all")
def capture_all_snapshots(db: Session = Depends(get_db)):
    """Capture price snapshots for ALL cards (run this daily)"""
    results = SnapshotService.capture_all_snapshots(db)
    
    return {
        "message": "Snapshot batch completed",
        "results": results
    }

@router.get("/{card_id}", response_model=List[PriceHistoryResponse])
def get_card_price_history(card_id: int, days: int = 90, db: Session = Depends(get_db)):
    """Get historical price snapshots for a card"""
    history = SnapshotService.get_card_history(db, card_id, days)
    
    return history