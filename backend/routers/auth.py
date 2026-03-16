from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models import User
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("SECRET_KEY", "gavelx-super-secret-key-2024")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

ADMIN_SECRET_CODE = "GAVELX_ADMIN_2024"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    admin_code: str = ""

class Token(BaseModel):
    access_token: str
    token_type: str
    is_admin: bool
    username: str
    user_id: int

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register")
async def register(user: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    is_admin = user.admin_code == ADMIN_SECRET_CODE

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        credits=0.0,
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "Registration successful",
        "username": new_user.username,
        "is_admin": new_user.is_admin
    }

@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "is_admin": user.is_admin,
        "username": user.username,
        "user_id": user.id
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "credits": current_user.credits,
        "is_admin": current_user.is_admin
    }
@router.get("/profile/{username}")
def get_profile(
    username: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from models import Bid, Auction
    total_bids = db.query(Bid).filter(Bid.bidder_id == user.id).count()
    wins = db.query(Bid).filter(
        Bid.bidder_id == user.id,
        Bid.is_winning == True
    ).count()
    total_spent = sum(
        b.amount for b in db.query(Bid).filter(
            Bid.bidder_id == user.id,
            Bid.is_winning == True
        ).all()
    )
    recent_bids = db.query(Bid).filter(
        Bid.bidder_id == user.id
    ).order_by(Bid.timestamp.desc()).limit(5).all()

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "credits": user.credits,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat(),
        "total_bids": total_bids,
        "wins": wins,
        "total_spent": total_spent,
        "recent_bids": [
            {
                "id": b.id,
                "auction_id": b.auction_id,
                "auction_title": b.auction.title,
                "amount": b.amount,
                "timestamp": b.timestamp.isoformat(),
                "is_winning": b.is_winning
            }
            for b in recent_bids
        ]
    }