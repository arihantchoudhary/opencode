"""Usage tracking endpoints."""

from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime, timedelta
from typing import List, Optional
import time
from ..models import (
    UsageSessionCreate,
    UsageSessionUpdate,
    UsageSession,
    UsageEventCreate,
    UsageEvent,
    UsageStats,
)
from ..db import get_db
from ..auth import verify_api_key

router = APIRouter(prefix="/usage", tags=["usage"])


@router.post("/sessions", response_model=UsageSession, status_code=201)
async def create_session(
    session_data: UsageSessionCreate, user_id: str = Depends(verify_api_key)
):
    """Create a new usage session."""
    db = get_db()

    # Calculate TTL (90 days from now)
    ttl = int((datetime.now() + timedelta(days=90)).timestamp())

    item = {
        "PK": f"USER#{user_id}",
        "SK": f"SESSION#{session_data.started_at.isoformat()}#{session_data.session_id}",
        "GSI1PK": f"USER#{user_id}",
        "GSI1SK": int(session_data.started_at.timestamp()),
        "sessionId": session_data.session_id,
        "userId": user_id,
        "startedAt": session_data.started_at.isoformat(),
        "endedAt": None,
        "duration": None,
        "messageCount": 0,
        "tokensUsed": 0,
        "tokensInput": 0,
        "tokensOutput": 0,
        "model": session_data.model,
        "platform": session_data.platform,
        "cliVersion": session_data.cli_version,
        "apiKey": session_data.api_key or "",
        "ttl": ttl,
    }

    db.sessions_table.put_item(Item=item)

    return UsageSession(
        session_id=session_data.session_id,
        user_id=user_id,
        started_at=session_data.started_at,
        model=session_data.model,
        platform=session_data.platform,
        cli_version=session_data.cli_version,
        api_key=session_data.api_key,
    )


@router.patch("/sessions/{session_id}", response_model=UsageSession)
async def update_session(
    session_id: str,
    update_data: UsageSessionUpdate,
    user_id: str = Depends(verify_api_key),
):
    """Update a usage session (typically when it ends)."""
    db = get_db()

    # Query to find the session
    response = db.sessions_table.query(
        KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
        ExpressionAttributeValues={
            ":pk": f"USER#{user_id}",
            ":sk_prefix": f"SESSION#",
        },
    )

    session_item = None
    for item in response.get("Items", []):
        if item["sessionId"] == session_id:
            session_item = item
            break

    if not session_item:
        raise HTTPException(status_code=404, detail="Session not found")

    # Update the session
    db.sessions_table.update_item(
        Key={"PK": session_item["PK"], "SK": session_item["SK"]},
        UpdateExpression="""
            SET endedAt = :ended_at,
                duration = :duration,
                messageCount = :message_count,
                tokensUsed = :tokens_used,
                tokensInput = :tokens_input,
                tokensOutput = :tokens_output
        """,
        ExpressionAttributeValues={
            ":ended_at": update_data.ended_at.isoformat(),
            ":duration": update_data.duration,
            ":message_count": update_data.message_count,
            ":tokens_used": update_data.tokens_used,
            ":tokens_input": update_data.tokens_input,
            ":tokens_output": update_data.tokens_output,
        },
    )

    # Fetch updated item
    updated_response = db.sessions_table.get_item(
        Key={"PK": session_item["PK"], "SK": session_item["SK"]}
    )

    item = updated_response["Item"]
    return UsageSession(
        session_id=item["sessionId"],
        user_id=user_id,
        started_at=datetime.fromisoformat(item["startedAt"]),
        ended_at=datetime.fromisoformat(item["endedAt"])
        if item.get("endedAt")
        else None,
        duration=item.get("duration"),
        message_count=item.get("messageCount", 0),
        tokens_used=item.get("tokensUsed", 0),
        tokens_input=item.get("tokensInput", 0),
        tokens_output=item.get("tokensOutput", 0),
        model=item["model"],
        platform=item["platform"],
        cli_version=item["cliVersion"],
        api_key=item.get("apiKey"),
    )


@router.post("/events", response_model=UsageEvent, status_code=201)
async def create_event(
    event_data: UsageEventCreate, user_id: str = Depends(verify_api_key)
):
    """Create a new usage event."""
    db = get_db()

    # Calculate TTL (30 days from now)
    ttl = int((datetime.now() + timedelta(days=30)).timestamp())

    item = {
        "PK": f"SESSION#{event_data.session_id}",
        "SK": f"EVENT#{event_data.timestamp.isoformat()}#{event_data.event_id}",
        "GSI1PK": f"USER#{user_id}",
        "GSI1SK": int(event_data.timestamp.timestamp()),
        "eventId": event_data.event_id,
        "sessionId": event_data.session_id,
        "userId": user_id,
        "timestamp": event_data.timestamp.isoformat(),
        "eventType": event_data.event_type,
        "toolName": event_data.tool_name,
        "tokensUsed": event_data.tokens_used,
        "duration": event_data.duration,
        "metadata": event_data.metadata,
        "apiKey": event_data.api_key or "",
        "ttl": ttl,
    }

    db.events_table.put_item(Item=item)

    return UsageEvent(
        event_id=event_data.event_id,
        session_id=event_data.session_id,
        user_id=user_id,
        timestamp=event_data.timestamp,
        event_type=event_data.event_type,
        tool_name=event_data.tool_name,
        tokens_used=event_data.tokens_used,
        duration=event_data.duration,
        metadata=event_data.metadata,
        api_key=event_data.api_key,
    )


@router.get("/sessions", response_model=List[UsageSession])
async def list_sessions(
    user_id: str = Depends(verify_api_key),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, le=1000),
):
    """List usage sessions for the authenticated user."""
    db = get_db()

    if start_date and end_date:
        # Query by time range using GSI
        response = db.sessions_table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :pk AND GSI1SK BETWEEN :start AND :end",
            ExpressionAttributeValues={
                ":pk": f"USER#{user_id}",
                ":start": int(start_date.timestamp()),
                ":end": int(end_date.timestamp()),
            },
            Limit=limit,
            ScanIndexForward=False,  # Most recent first
        )
    else:
        # Query all sessions
        response = db.sessions_table.query(
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues={
                ":pk": f"USER#{user_id}",
                ":sk": "SESSION#",
            },
            Limit=limit,
            ScanIndexForward=False,
        )

    sessions = []
    for item in response.get("Items", []):
        sessions.append(
            UsageSession(
                session_id=item["sessionId"],
                user_id=user_id,
                started_at=datetime.fromisoformat(item["startedAt"]),
                ended_at=datetime.fromisoformat(item["endedAt"])
                if item.get("endedAt")
                else None,
                duration=item.get("duration"),
                message_count=item.get("messageCount", 0),
                tokens_used=item.get("tokensUsed", 0),
                tokens_input=item.get("tokensInput", 0),
                tokens_output=item.get("tokensOutput", 0),
                model=item["model"],
                platform=item["platform"],
                cli_version=item["cliVersion"],
                api_key=item.get("apiKey"),
            )
        )

    return sessions


@router.get("/stats", response_model=UsageStats)
async def get_usage_stats(
    user_id: str = Depends(verify_api_key),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
):
    """Get usage statistics for the authenticated user."""
    db = get_db()

    if start_date and end_date:
        response = db.sessions_table.query(
            IndexName="GSI1",
            KeyConditionExpression="GSI1PK = :pk AND GSI1SK BETWEEN :start AND :end",
            ExpressionAttributeValues={
                ":pk": f"USER#{user_id}",
                ":start": int(start_date.timestamp()),
                ":end": int(end_date.timestamp()),
            },
        )
    else:
        response = db.sessions_table.query(
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues={
                ":pk": f"USER#{user_id}",
                ":sk": "SESSION#",
            },
        )

    items = response.get("Items", [])
    total_sessions = len(items)
    total_tokens = sum(item.get("tokensUsed", 0) for item in items)
    total_messages = sum(item.get("messageCount", 0) for item in items)
    total_duration = sum(item.get("duration", 0) for item in items if item.get("duration"))

    avg_session_duration = total_duration / total_sessions if total_sessions > 0 else 0
    avg_tokens_per_session = total_tokens / total_sessions if total_sessions > 0 else 0

    return UsageStats(
        total_sessions=total_sessions,
        total_tokens=total_tokens,
        total_messages=total_messages,
        total_duration=total_duration,
        avg_session_duration=avg_session_duration,
        avg_tokens_per_session=avg_tokens_per_session,
    )
