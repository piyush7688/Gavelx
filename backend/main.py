from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
import models
from routers import auth, auctions, bids, credits, bot, chat, reports, upload
from scheduler import start_scheduler
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GavelX API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(auctions.router)
app.include_router(bids.router)
app.include_router(credits.router)
app.include_router(bot.router)
app.include_router(chat.router)
app.include_router(reports.router)
app.include_router(upload.router)

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.get("/")
def root():
    return {"message": "Welcome to GavelX API"}