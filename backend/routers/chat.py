from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Message, User
from routers.auth import get_current_user
from pydantic import BaseModel
from typing import Dict, List
import json

router = APIRouter(prefix="/chat", tags=["Chat"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected. Total: {len(self.active_connections)}")

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"User {user_id} disconnected")

    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception:
                self.disconnect(user_id)

    async def broadcast(self, message: dict, exclude_id: int = None):
        disconnected = []
        for user_id, connection in self.active_connections.items():
            if user_id != exclude_id:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    disconnected.append(user_id)
        for user_id in disconnected:
            self.disconnect(user_id)

manager = ConnectionManager()

class SendMessage(BaseModel):
    receiver_id: int = None
    content: str
    is_broadcast: bool = False

@router.websocket("/ws/{user_id}/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    from jose import jwt, JWTError
    import os
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY", "gavelx-super-secret-key-2024"), algorithms=["HS256"])
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        if not user or user.id != user_id:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            content = msg_data.get("content", "")
            receiver_id = msg_data.get("receiver_id")
            is_broadcast = msg_data.get("is_broadcast", False)

            new_msg = Message(
                sender_id=user_id,
                receiver_id=receiver_id,
                content=content,
                is_broadcast=is_broadcast,
                is_read=False
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)

            message_payload = {
                "id": new_msg.id,
                "sender_id": user_id,
                "sender_name": user.username,
                "receiver_id": receiver_id,
                "content": content,
                "is_broadcast": is_broadcast,
                "timestamp": new_msg.timestamp.isoformat(),
                "is_admin": user.is_admin
            }

            if is_broadcast:
                await manager.broadcast(message_payload, exclude_id=None)
            elif receiver_id:
                await manager.send_to_user(receiver_id, message_payload)
                await manager.send_to_user(user_id, message_payload)
            else:
                await manager.send_to_user(user_id, message_payload)

    except WebSocketDisconnect:
        manager.disconnect(user_id)

@router.get("/history/{other_user_id}")
def get_chat_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()

    for msg in messages:
        if msg.receiver_id == current_user.id:
            msg.is_read = True
    db.commit()

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_name": m.sender.username,
            "content": m.content,
            "timestamp": m.timestamp.isoformat(),
            "is_read": m.is_read,
            "is_broadcast": m.is_broadcast
        }
        for m in messages
    ]

@router.get("/unread")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).count()
    return {"unread": count}

@router.get("/users")
def get_chat_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins only")
    users = db.query(User).filter(User.is_admin == False).all()
    result = []
    for u in users:
        unread = db.query(Message).filter(
            Message.sender_id == u.id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()
        result.append({
            "id": u.id,
            "username": u.username,
            "unread": unread,
            "online": u.id in manager.active_connections
        })
    return result