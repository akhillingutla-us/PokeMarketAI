from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.config import engine, Base
from app.routers import cards

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="PokéMarket AI API",
    description="Backend API for Pokémon TCG portfolio tracking",
    version="1.0.0"
)

# CORS middleware (allows React Native to call this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cards.router)

# Health check endpoint
@app.get("/")
def root():
    return {"message": "PokéMarket AI API is running!", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}