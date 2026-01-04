from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PriceHistoryBase(BaseModel):
    card_id: int
    market_price: Optional[float] = None
    low_price: Optional[float] = None
    high_price: Optional[float] = None
    condition: str = "Near Mint"

class PriceHistoryCreate(PriceHistoryBase):
    pass

class PriceHistoryResponse(PriceHistoryBase):
    id: int
    snapshot_date: datetime
    
    class Config:
        from_attributes = True