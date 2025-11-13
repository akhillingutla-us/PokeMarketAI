from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database.config import Base

class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    card_name = Column(String, nullable=False, index=True)
    set_name = Column(String, nullable=True)
    card_number = Column(String, nullable=True)
    rarity = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    confidence = Column(String, nullable=True)
    image_url = Column(String, nullable=True)  # We'll store images later
    current_price = Column(Float, nullable=True)  # Price tracking later
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Card {self.card_name} - {self.set_name}>"