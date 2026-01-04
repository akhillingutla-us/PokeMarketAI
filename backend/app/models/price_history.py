from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.config import Base

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    
    # Price snapshot
    market_price = Column(Float, nullable=True)
    low_price = Column(Float, nullable=True)
    high_price = Column(Float, nullable=True)
    
    # Timestamp
    snapshot_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Optional: condition tracking
    condition = Column(String, default="Near Mint")