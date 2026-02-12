from fastapi import APIRouter, HTTPException, Query

from app import db
from app.models import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserResponse, status_code=201)
def signup(body: UserCreate):
    existing = db.get_user_by_email(body.email)
    if existing:
        raise HTTPException(400, "Email already registered")
    return db.create_user(body.model_dump())


@router.post("/login", response_model=UserResponse)
def login(email: str = Query(...)):
    user = db.get_user_by_email(email)
    if not user:
        raise HTTPException(404, "User not found")
    return user
