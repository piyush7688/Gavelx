from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Auction, User, Bid
from routers.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/auctions", tags=["Auctions"])

class AuctionCreate(BaseModel):
    title: str
    description: str
    image_url: Optional[str] = None
    start_time: datetime
    end_time: datetime
    minimum_bid: float

class AuctionOut(BaseModel):
    id: int
    title: str
    description: str
    image_url: Optional[str]
    start_time: datetime
    end_time: datetime
    minimum_bid: float
    current_bid: float
    is_closed: bool

    class Config:
        from_attributes = True

@router.post("/create")
def create_auction(
    auction: AuctionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create auctions")
    new_auction = Auction(
        title=auction.title,
        description=auction.description,
        image_url=auction.image_url,
        start_time=auction.start_time,
        end_time=auction.end_time,
        minimum_bid=auction.minimum_bid,
        current_bid=0.0,
        is_closed=False
    )
    db.add(new_auction)
    db.commit()
    db.refresh(new_auction)
    return {"message": "Auction created", "auction_id": new_auction.id}

@router.get("/all")
def get_all_auctions(db: Session = Depends(get_db)):
    auctions = db.query(Auction).filter(Auction.is_closed == False).all()
    return auctions

@router.get("/{auction_id}")
def get_auction(auction_id: int, db: Session = Depends(get_db)):
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@router.post("/{auction_id}/close")
def close_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can close auctions")
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    if auction.is_closed:
        raise HTTPException(status_code=400, detail="Auction already closed")

    winning_bid = db.query(Bid).filter(
        Bid.auction_id == auction_id
    ).order_by(Bid.amount.desc()).first()

    if winning_bid:
        auction.winner_id = winning_bid.bidder_id
        winning_bid.is_winning = True
        winner = db.query(User).filter(User.id == winning_bid.bidder_id).first()
        winner.credits -= winning_bid.amount

        losing_bids = db.query(Bid).filter(
            Bid.auction_id == auction_id,
            Bid.id != winning_bid.id
        ).all()
        for bid in losing_bids:
            bidder = db.query(User).filter(User.id == bid.bidder_id).first()
            bidder.credits += bid.amount

    auction.is_closed = True
    db.commit()
    return {"message": "Auction closed", "winner_id": auction.winner_id}

@router.delete("/{auction_id}")
def delete_auction(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete auctions")
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    db.delete(auction)
    db.commit()
    return {"message": "Auction deleted"}