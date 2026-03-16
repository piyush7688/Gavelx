from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database import SessionLocal
from models import Auction, Bid, User
from datetime import datetime

scheduler = AsyncIOScheduler()

async def auto_close_auctions():
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        expired = db.query(Auction).filter(
            Auction.is_closed == False,
            Auction.end_time <= now
        ).all()

        for auction in expired:
            print(f"Auto closing auction: {auction.title}")

            winning_bid = db.query(Bid).filter(
                Bid.auction_id == auction.id
            ).order_by(Bid.amount.desc()).first()

            if winning_bid:
                auction.winner_id = winning_bid.bidder_id
                winning_bid.is_winning = True

                winner = db.query(User).filter(
                    User.id == winning_bid.bidder_id
                ).first()
                winner.credits -= winning_bid.amount
                print(f"Winner: {winner.username} — deducted {winning_bid.amount} credits")

                losing_bids = db.query(Bid).filter(
                    Bid.auction_id == auction.id,
                    Bid.id != winning_bid.id
                ).all()

                for bid in losing_bids:
                    bidder = db.query(User).filter(
                        User.id == bid.bidder_id
                    ).first()
                    bidder.credits += bid.amount
                    print(f"Refunded {bid.amount} credits to {bidder.username}")

            auction.is_closed = True
            db.commit()
            print(f"Auction {auction.id} closed successfully")

    except Exception as e:
        print(f"Scheduler error: {e}")
        db.rollback()
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(
        auto_close_auctions,
        'interval',
        seconds=30,
        id='auto_close',
        replace_existing=True
    )
    scheduler.start()
    print("Scheduler started — checking auctions every 30 seconds")