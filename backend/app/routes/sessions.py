from fastapi import APIRouter, HTTPException

from app import db
from app.models import SessionReport, SessionResponse

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/report", status_code=200)
def report_session(body: SessionReport):
    result = db.upsert_session(body.model_dump())
    return {"status": "ok", "session_id": result["session_id"]}


@router.get("/", response_model=list[SessionResponse])
def list_all(limit: int = 100):
    return db.list_sessions(limit)


@router.get("/{session_id}", response_model=SessionResponse)
def get(session_id: str):
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.get("/user/{user_id}", response_model=list[SessionResponse])
def list_by_user(user_id: str):
    return db.list_sessions_by_user(user_id)
