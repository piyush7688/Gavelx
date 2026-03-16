from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from routers.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/credits", tags=["Credits"])

class CreditAssign(BaseModel):
    user_id: int
    amount: float

@router.post("/assign")
def assign_credits(
    data: CreditAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can assign credits")
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.credits += data.amount
    db.commit()
    return {
        "message": f"Assigned {data.amount} credits to {user.username}",
        "new_balance": user.credits
    }

@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user)
):
    return {
        "username": current_user.username,
        "credits": current_user.credits
    }

@router.get("/all-users")
def get_all_users_credits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view all balances")
    users = db.query(User).filter(User.is_admin == False).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "credits": u.credits,
            "is_active": u.is_active
        }
        for u in users
    ]