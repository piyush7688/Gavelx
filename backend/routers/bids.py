from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Bid, Auction, User
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(prefix="/bids", tags=["Bids"])

class BidCreate(BaseModel):
    amount: float

@router.post("/{auction_id}/place")
async def place_bid(
    auction_id: int,
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.is_closed:
        raise HTTPException(status_code=400, detail="Auction is closed")
    from datetime import timezone
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if now < auction.start_time:
        raise HTTPException(status_code=400, detail="Auction has not started yet")
    if now > auction.end_time:
        raise HTTPException(status_code=400, detail="Auction has ended")
    if bid.amount < auction.minimum_bid:
        raise HTTPException(status_code=400, detail=f"Minimum bid is {auction.minimum_bid}")
    if bid.amount <= auction.current_bid:
        raise HTTPException(status_code=400, detail=f"Bid must be higher than current bid {auction.current_bid}")
    if current_user.credits < bid.amount:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    previous_top = db.query(Bid).filter(
        Bid.auction_id == auction_id
    ).order_by(Bid.amount.desc()).first()

    time_extended = False
    seconds_left = (auction.end_time - now).total_seconds()
    if seconds_left <= 30:
        auction.end_time = auction.end_time + timedelta(seconds=60)
        auction.extension_count += 1
        time_extended = True

    new_bid = Bid(
        amount=bid.amount,
        bidder_id=current_user.id,
        auction_id=auction_id,
        is_winning=False
    )
    auction.current_bid = bid.amount
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)

    if previous_top and previous_top.bidder_id != current_user.id:
        prev_bidder = db.query(User).filter(
            User.id == previous_top.bidder_id
        ).first()
        try:
            from email_service import send_outbid_email
            await send_outbid_email(
                prev_bidder.email,
                prev_bidder.username,
                auction.title,
                bid.amount
            )
        except Exception:
            pass

    return {
        "message": "Bid placed successfully",
        "bid_id": new_bid.id,
        "amount": new_bid.amount,
        "auction_id": auction_id,
        "time_extended": time_extended,
        "new_end_time": auction.end_time.isoformat() if time_extended else None,
        "extension_count": auction.extension_count
    }

@router.get("/{auction_id}/all")
def get_auction_bids(auction_id: int, db: Session = Depends(get_db)):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    bids = db.query(Bid).filter(
        Bid.auction_id == auction_id
    ).order_by(Bid.amount.desc()).all()
    return bids

@router.get("/my/history")
def get_my_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bids = db.query(Bid).filter(
        Bid.bidder_id == current_user.id
    ).order_by(Bid.timestamp.desc()).all()
    return bids