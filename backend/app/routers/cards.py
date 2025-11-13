from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.config import get_db
from app.models.card import Card
from app.schemas.card import CardCreate, CardResponse

router = APIRouter(prefix="/cards", tags=["cards"])

# Create a new card
@router.post("/", response_model=CardResponse)
def create_card(card: CardCreate, db: Session = Depends(get_db)):
    db_card = Card(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

# Get all cards
@router.get("/", response_model=List[CardResponse])
def get_all_cards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cards = db.query(Card).offset(skip).limit(limit).all()
    return cards

# Get a single card by ID
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