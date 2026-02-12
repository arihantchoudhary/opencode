from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    auth_provider: str = "email"
    signup_source: str = "web"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: str
    updated_at: str
    auth_provider: str
    signup_source: str
