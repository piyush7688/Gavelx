from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from routers.auth import get_current_user
from models import User
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/bot", tags=["Assistant Bot"])

class BotMessage(BaseModel):
    message: str

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")

SYSTEM_PROMPT = """You are GavelX Assistant, a helpful AI bot for the GavelX auction platform.

About GavelX:
- GavelX is a credit-based auction platform
- Admins create auctions with title, description, start time, end time and minimum bid
- Bidders use credits to place bids on auctions
- Credits are assigned by the admin
- When an auction closes, the highest bidder wins and their credits are deducted
- Non-winning bids get credits refunded automatically
- Bid Shield: if someone bids in last 30 seconds, clock extends by 60 seconds
- This prevents last-second sniping and keeps auctions fair

Your job:
- Help bidders understand how the platform works
- Give bidding tips and strategies
- Explain the credits system
- Answer questions about auctions
- Be friendly, helpful and concise
- Always stay on topic about GavelX

Keep responses short and clear — max 3-4 sentences."""

@router.post("/ask")
async def ask_bot(
    body: BotMessage,
    current_user: User = Depends(get_current_user)
):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "max_tokens": 300,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": body.message}
                    ]
                },
                timeout=30.0
            )

        print("Groq status:", response.status_code)
        print("Groq response:", response.text)

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Groq error: {response.text}"
            )

        data = response.json()
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply}

    except httpx.TimeoutException:
        raise HTTPException(status_code=500, detail="Request timed out — try again")
    except Exception as e:
        print("Bot error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))