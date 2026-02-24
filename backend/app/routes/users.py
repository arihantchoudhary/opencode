from collections import Counter

from fastapi import APIRouter, HTTPException

from app import db
from app.models import DailyActivity, UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/stats/daily", response_model=list[DailyActivity])
def daily_activity():
    users = db.list_users(limit=1000)
    counts: Counter[str] = Counter()
    for user in users:
        created = user.get("created_at", "")
        if created:
            date = created[:10]
            counts[date] += 1
    return sorted(
        [{"date": date, "count": count} for date, count in counts.items()],
        key=lambda x: x["date"],
    )


@router.post("/", response_model=UserResponse, status_code=201)
def create(body: UserCreate):
    # If clerk_id provided, check if user already exists (upsert)
    if body.clerk_id:
        existing = db.get_user_by_clerk_id(body.clerk_id)
        if existing:
            updates = body.model_dump(exclude_unset=True)
            updates.pop("clerk_id", None)
            return db.update_user(existing["user_id"], updates) or existing
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


@router.get("/by-clerk/{clerk_id}", response_model=UserResponse)
def get_by_clerk(clerk_id: str):
    user = db.get_user_by_clerk_id(clerk_id)
    if not user:
        # Auto-create user on first access so frontend never gets a 404
        user = db.create_user({
            "clerk_id": clerk_id,
            "email": "",
            "name": "",
            "auth_provider": "clerk",
            "signup_source": "web",
        })
    return user


@router.patch("/by-clerk/{clerk_id}", response_model=UserResponse)
def update_by_clerk(clerk_id: str, body: UserUpdate):
    user = db.get_user_by_clerk_id(clerk_id)
    if not user:
        # Auto-create then update
        user = db.create_user({
            "clerk_id": clerk_id,
            "email": "",
            "name": "",
            "auth_provider": "clerk",
            "signup_source": "web",
        })
    updated = db.update_user(user["user_id"], body.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(500, "Failed to update user")
    return updated


@router.delete("/{user_id}", status_code=204)
def delete(user_id: str):
    if not db.delete_user(user_id):
        raise HTTPException(404, "User not found")
