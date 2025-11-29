"""Pydantic models for API requests and responses."""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


# User models
class UserCreate(BaseModel):
    email: str
    plan: str = "free"


class User(BaseModel):
    user_id: str
    email: str
    created_at: datetime
    updated_at: datetime
    status: str
    plan: str


# API Key models
class APIKeyCreate(BaseModel):
    name: str
    expires_at: Optional[datetime] = None


class APIKey(BaseModel):
    key_id: str
    user_id: str
    key_prefix: str
    name: str
    created_at: datetime
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    status: str


class APIKeyResponse(BaseModel):
    api_key: str  # Full key only returned on creation
    key_id: str
    name: str
    created_at: datetime


# Usage Session models
class UsageSessionCreate(BaseModel):
    session_id: str
    started_at: datetime
    model: str
    platform: str
    cli_version: str
    api_key: Optional[str] = None


class UsageSessionUpdate(BaseModel):
    ended_at: datetime
    duration: int
    message_count: int
    tokens_used: int
    tokens_input: int
    tokens_output: int


class UsageSession(BaseModel):
    session_id: str
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration: Optional[int] = None
    message_count: int = 0
    tokens_used: int = 0
    tokens_input: int = 0
    tokens_output: int = 0
    model: str
    platform: str
    cli_version: str
    api_key: Optional[str] = None


# Usage Event models
class UsageEventCreate(BaseModel):
    event_id: str
    session_id: str
    timestamp: datetime
    event_type: str
    tool_name: Optional[str] = None
    tokens_used: int = 0
    duration: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    api_key: Optional[str] = None


class UsageEvent(BaseModel):
    event_id: str
    session_id: str
    user_id: str
    timestamp: datetime
    event_type: str
    tool_name: Optional[str] = None
    tokens_used: int
    duration: Optional[int] = None
    metadata: Dict[str, Any]
    api_key: Optional[str] = None


# Analytics models
class UsageStats(BaseModel):
    total_sessions: int
    total_tokens: int
    total_messages: int
    total_duration: int
    avg_session_duration: float
    avg_tokens_per_session: float
