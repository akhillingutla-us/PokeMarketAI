from app.database.config import engine, Base
from app.models.card import Card

print("Dropping old tables...")
Base.metadata.drop_all(bind=engine)

print("Creating new tables with price columns...")
Base.metadata.create_all(bind=engine)

print("✓ Database recreated successfully!")
