from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from routers.auth import get_current_user
from models import User
import os
import uuid
from PIL import Image
import io

router = APIRouter(prefix="/upload", tags=["Upload"])

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
MAX_SIZE = 5 * 1024 * 1024

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can upload images")

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WebP and GIF allowed")

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB")

    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    img = Image.open(io.BytesIO(contents))
    if img.width > 1200 or img.height > 1200:
        img.thumbnail((1200, 1200))

    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = f"uploads/{filename}"

    img_bytes = io.BytesIO()
    fmt = "JPEG" if ext in ["jpg", "jpeg"] else ext.upper()
    img.save(img_bytes, format=fmt)
    img_bytes.seek(0)

    with open(filepath, "wb") as f:
        f.write(img_bytes.read())

    return {
        "url": f"http://localhost:8000/uploads/{filename}",
        "filename": filename
    }