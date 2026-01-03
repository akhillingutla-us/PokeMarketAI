from app.services.price_history_service import PriceHistoryService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.config import get_db
from app.models.card import Card
from app.schemas.card import CardCreate, CardResponse
from app.services.price_service import PriceService

router = APIRouter(prefix="/cards", tags=["cards"])

# Create a new card
@router.post("/", response_model=CardResponse)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    # Create card from input data
    db_card = Card(**card.dict())
    
    # Fetch prices from PokemonTCG.io API
    print(f"Fetching prices for: {card.card_name} - {card.set_name}")
    price_data = PriceService.fetch_card_price(card.card_name, card.set_name)
    
    # Add price data if found
    if price_data:
        db_card.market_price = price_data.get("market_price")
        db_card.low_price = price_data.get("low_price")
        db_card.high_price = price_data.get("high_price")
        db_card.last_price_update = price_data.get("last_price_update")
        print(f"✓ Prices fetched: Market=${price_data.get('market_price')}")
    else:
        print(f"✗ No prices found for {card.card_name}")
    
    # Save to database
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

# Get all cards
@router.get("/", response_model=List[CardResponse])
def get_all_cards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cards = db.query(Card).offset(skip).limit(limit).all()
    return cards

# Get price history for a card (BEFORE /{card_id})
@router.get("/{card_id}/price-history")
def get_card_price_history(card_id: int, db: Session = Depends(get_db)):
    """
    Get 90-day price history for a card
    """
    # Get the card from database
    card = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Fetch price history
    print(f"Fetching price history for: {card.card_name} - {card.set_name}")
    history_data = PriceHistoryService.get_price_history(card.card_name, card.set_name)
    
    if not history_data:
        return {
            "card_id": card.id,
            "card_name": card.card_name,
            "message": "Price history not available",
            "price_history": None
        }
    
    # Analyze trends
    trend_analysis = PriceHistoryService.analyze_trend(history_data.get('price_history', {}))
    
    return {
        "card_id": card.id,
        "card_name": card.card_name,
        "set_name": card.set_name,
        "current_price": card.market_price,
        "price_history": history_data.get('price_history'),
        "trend_analysis": trend_analysis,
        "last_updated": history_data.get('last_updated')
    }

# Get a single card by ID (AFTER /price-history)
@router.get("/{card_id}", response_model=CardResponse)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

# Delete a card
@router.delete("/{card_id}")
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found")
    db.delete(card)
    db.commit()
    return {"message": "Card deleted successfully"}