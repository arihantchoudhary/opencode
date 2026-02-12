from fastapi import APIRouter, HTTPException

from app import db
from app.models import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=201)
def create(body: UserCreate):
    existing = db.get_user_by_email(body.email)
    if existing:
        raise HTTPException(400, "User with this email already exists")
    return db.create_user(body.model_dump())


@router.get("/", response_model=list[UserResponse])
def list_all(limit: int = 50):
    return db.list_users(limit)


@router.get("/{user_id}", response_model=UserResponse)
def get(user_id: str):
    user = db.get_user(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update(user_id: str, body: UserUpdate):
    user = db.update_user(user_id, body.model_dump(exclude_unset=True))
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.delete("/{user_id}", status_code=204)
def delete(user_id: str):
    if not db.delete_user(user_id):
        raise HTTPException(404, "User not found")
