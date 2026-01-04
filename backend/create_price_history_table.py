from app.database.config import engine, Base
from app.models.price_history import PriceHistory
from app.models.card import Card

# Import all models so they're registered
print("Creating price_history table...")

# Create all tables (will only create new ones)
Base.metadata.create_all(bind=engine)

print("✓ price_history table created successfully!")