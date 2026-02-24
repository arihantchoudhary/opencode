from fastapi import APIRouter, HTTPException, Query
import requests

from app.config import settings

router = APIRouter(prefix="/api/twitter", tags=["twitter"])

TWITTER_API_BASE = "https://api.twitter.com/2"

# Cache the user ID so we don't resolve it on every request
_user_id_cache: str | None = None


def _headers():
    return {"Authorization": f"Bearer {settings.twitter_bearer_token}"}


def _resolve_user_id() -> str:
    global _user_id_cache
    if _user_id_cache:
        return _user_id_cache

    resp = requests.get(
        f"{TWITTER_API_BASE}/users/by/username/Stardropper",
        headers=_headers(),
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Failed to resolve Twitter user")

    user_data = resp.json().get("data")
    if not user_data:
        raise HTTPException(status_code=404, detail="Twitter user @Stardropper not found")

    _user_id_cache = user_data["id"]
    return _user_id_cache


@router.get("/mentions")
def get_mentions(
    max_results: int = Query(default=20, ge=5, le=100),
    pagination_token: str | None = Query(default=None),
    since_id: str | None = Query(default=None),
    until_id: str | None = Query(default=None),
    start_time: str | None = Query(default=None),
    end_time: str | None = Query(default=None),
):
    """
    Fetch recent posts mentioning @Stardropper.
    Uses GET /2/users/{id}/mentions from the Twitter API v2.
    """
    if not settings.twitter_bearer_token:
        raise HTTPException(status_code=503, detail="Twitter API not configured")

    user_id = _resolve_user_id()

    params: dict = {
        "max_results": max_results,
        "tweet.fields": "author_id,created_at,entities,public_metrics,referenced_tweets,text",
        "expansions": "author_id,attachments.media_keys,referenced_tweets.id",
        "user.fields": "name,username,profile_image_url,verified,description",
        "media.fields": "preview_image_url,type,url,width,height",
    }
    if pagination_token:
        params["pagination_token"] = pagination_token
    if since_id:
        params["since_id"] = since_id
    if until_id:
        params["until_id"] = until_id
    if start_time:
        params["start_time"] = start_time
    if end_time:
        params["end_time"] = end_time

    resp = requests.get(
        f"{TWITTER_API_BASE}/users/{user_id}/mentions",
        headers=_headers(),
        params=params,
        timeout=10,
    )

    if resp.status_code == 429:
        raise HTTPException(status_code=429, detail="Twitter rate limit exceeded")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Twitter API error: {resp.text}")

    return resp.json()
