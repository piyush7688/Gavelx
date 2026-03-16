from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Auction, Bid, User
from routers.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_auctions = db.query(Auction).count()
    active_auctions = db.query(Auction).filter(Auction.is_closed == False).count()
    closed_auctions = db.query(Auction).filter(Auction.is_closed == True).count()
    total_bids = db.query(Bid).count()
    total_users = db.query(User).filter(User.is_admin == False).count()
    total_credits = db.query(User).filter(User.is_admin == False).with_entities(
        db.query(User.credits).filter(User.is_admin == False).subquery()
    )
    users = db.query(User).filter(User.is_admin == False).all()
    total_credits_in_system = sum(u.credits for u in users)

    return {
        "total_auctions": total_auctions,
        "active_auctions": active_auctions,
        "closed_auctions": closed_auctions,
        "total_bids": total_bids,
        "total_users": total_users,
        "total_credits_in_system": total_credits_in_system
    }

@router.get("/bids-per-auction")
def get_bids_per_auction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    auctions = db.query(Auction).all()
    result = []
    for a in auctions:
        bid_count = db.query(Bid).filter(Bid.auction_id == a.id).count()
        result.append({
            "auction_id": a.id,
            "title": a.title[:20],
            "bid_count": bid_count,
            "current_bid": a.current_bid,
            "is_closed": a.is_closed
        })
    return result

@router.get("/credits-per-user")
def get_credits_per_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.is_admin == False).all()
    return [
        {"username": u.username, "credits": u.credits}
        for u in users
    ]

@router.get("/recent-bids")
def get_recent_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bids = db.query(Bid).order_by(Bid.timestamp.desc()).limit(20).all()
    return [
        {
            "id": b.id,
            "bidder": b.bidder.username,
            "auction": b.auction.title[:20],
            "amount": b.amount,
            "timestamp": b.timestamp.isoformat(),
            "is_winning": b.is_winning
        }
        for b in bids
    ]

@router.get("/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.is_admin == False).all()
    result = []
    for u in users:
        total_bids = db.query(Bid).filter(Bid.bidder_id == u.id).count()
        wins = db.query(Bid).filter(
            Bid.bidder_id == u.id,
            Bid.is_winning == True
        ).count()
        total_spent = sum(
            b.amount for b in db.query(Bid).filter(
                Bid.bidder_id == u.id,
                Bid.is_winning == True
            ).all()
        )
        result.append({
            "username": u.username,
            "total_bids": total_bids,
            "wins": wins,
            "credits_remaining": u.credits,
            "total_spent": total_spent
        })
    result.sort(key=lambda x: x["wins"], reverse=True)
    return result