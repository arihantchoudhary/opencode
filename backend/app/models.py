from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    name: str
    clerk_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    twitter_handle: Optional[str] = None
    auth_provider: str = "email"
    signup_source: str = "web"
    reference: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    twitter_handle: Optional[str] = None


class DailyActivity(BaseModel):
    date: str
    count: int


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    clerk_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    twitter_handle: Optional[str] = None
    created_at: str
    updated_at: str
    auth_provider: str
    signup_source: str
    reference: Optional[str] = None
    last_login: Optional[str] = None


class SessionReport(BaseModel):
    session_id: str
    user_id: str
    user_email: str
    user_name: str
    title: str
    project_id: str
    directory: str
    version: str
    status: str
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None
    summary: Optional[dict] = None


class SessionResponse(BaseModel):
    session_id: str
    user_id: str
    user_email: str
    user_name: str
    title: str
    project_id: str
    directory: str
    version: str
    status: str
    created_at: str
    updated_at: str
    completed_at: Optional[str] = None
    summary: Optional[dict] = None
