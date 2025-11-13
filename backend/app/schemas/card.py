from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Schema for creating a card
class CardCreate(BaseModel):
    card_name: str
    set_name: Optional[str] = None
    card_number: Optional[str] = None
    rarity: Optional[str] = None
    condition: Optional[str] = None
    confidence: Optional[str] = None
    image_url: Optional[str] = None
    current_price: Optional[float] = None

# Schema for reading a card (includes DB fields)
class CardResponse(CardCreate):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Allows SQLAlchemy models to be converted