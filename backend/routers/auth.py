from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from services.supabase_client import get_supabase

router = APIRouter()


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: AuthRequest):
    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_up({"email": body.email, "password": body.password})
        if resp.user is None:
            raise HTTPException(status_code=400, detail="Registration failed")
        return {"message": "Registration successful. Check your email to confirm your account."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(body: AuthRequest):
    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        if resp.session is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "access_token": resp.session.access_token,
            "token_type": "bearer",
            "user": {"id": resp.user.id, "email": resp.user.email},
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
