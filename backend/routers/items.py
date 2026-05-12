from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import date

from dependencies import get_current_user
from services.supabase_client import get_supabase

router = APIRouter()


class ItemCreate(BaseModel):
    name: str
    expiry_date: Optional[date] = None
    quantity: Optional[int] = 1
    notes: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = None
    notes: Optional[str] = None


@router.get("/")
async def list_items(user=Depends(get_current_user)):
    supabase = get_supabase()
    resp = supabase.table("items").select("*").eq("user_id", user.id).order("expiry_date").execute()
    return resp.data


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_item(body: ItemCreate, user=Depends(get_current_user)):
    supabase = get_supabase()
    payload = {
        "user_id": user.id,
        "name": body.name,
        "expiry_date": body.expiry_date.isoformat() if body.expiry_date else None,
        "quantity": body.quantity,
        "notes": body.notes,
    }
    resp = supabase.table("items").insert(payload).execute()
    return resp.data[0]


@router.patch("/{item_id}")
async def update_item(item_id: str, body: ItemUpdate, user=Depends(get_current_user)):
    supabase = get_supabase()
    existing = supabase.table("items").select("id").eq("id", item_id).eq("user_id", user.id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Item not found")

    updates = body.model_dump(exclude_none=True)
    if "expiry_date" in updates and updates["expiry_date"] is not None:
        updates["expiry_date"] = updates["expiry_date"].isoformat()

    resp = supabase.table("items").update(updates).eq("id", item_id).execute()
    return resp.data[0]


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, user=Depends(get_current_user)):
    supabase = get_supabase()
    existing = supabase.table("items").select("id").eq("id", item_id).eq("user_id", user.id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Item not found")
    supabase.table("items").delete().eq("id", item_id).execute()
