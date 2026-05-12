from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional

from dependencies import get_current_user
from services.supabase_client import get_supabase
from services import typhoon

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


class ScanResult(BaseModel):
    name: Optional[str]
    expiry_date: Optional[str]
    ocr_text: str
    saved_item: Optional[dict] = None


@router.post("/", response_model=ScanResult)
async def scan_label(
    file: UploadFile = File(...),
    save: bool = True,
    user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are accepted")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image must be under 10 MB")

    ocr_text = await typhoon.ocr_image(image_bytes, mime_type=file.content_type)
    parsed = await typhoon.parse_label(ocr_text)

    name = parsed.get("name")
    expiry_date = parsed.get("expiry_date")

    saved_item = None
    if save and name:
        supabase = get_supabase()
        payload = {
            "user_id": user.id,
            "name": name,
            "expiry_date": expiry_date,
            "quantity": 1,
        }
        resp = supabase.table("items").insert(payload).execute()
        saved_item = resp.data[0] if resp.data else None

    return ScanResult(name=name, expiry_date=expiry_date, ocr_text=ocr_text, saved_item=saved_item)
