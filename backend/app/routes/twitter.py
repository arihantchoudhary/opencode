from datetime import datetime, timedelta, timezone
from decimal import Decimal

import boto3
import requests
from fastapi import APIRouter, HTTPException, Query

from app.config import settings

REFRESH_RATE_LIMIT = 4
REFRESH_RATE_WINDOW_SECONDS = 60

router = APIRouter(prefix="/api/twitter", tags=["twitter"])

TWITTER_API_BASE = "https://api.twitter.com/2"


def _headers():
    return {"Authorization": f"Bearer {settings.twitter_bearer_token}"}


def _get_tweets_table():
    dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
    return dynamodb.Table(settings.dynamodb_tweets_table_name)


def _convert_decimals(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, dict):
        return {k: _convert_decimals(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_decimals(i) for i in obj]
    return obj


def _convert_for_dynamo(obj):
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, int) and not isinstance(obj, bool):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _convert_for_dynamo(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_for_dynamo(i) for i in obj]
    return obj


def _cache_key_for(username: str) -> str:
    return f"{username}_mentions"


def _user_cache_key(username: str) -> str:
    return f"{username}_user_id"


def _get_cache(username: str):
    table = _get_tweets_table()
    try:
        resp = table.get_item(Key={"cache_key": _cache_key_for(username)})
    except Exception:
        return None, False

    item = resp.get("Item")
    if not item:
        return None, False

    cached_at = item.get("cached_at", "")
    if cached_at:
        cached_time = datetime.fromisoformat(cached_at)
        now = datetime.now(timezone.utc)
        age_minutes = (now - cached_time).total_seconds() / 60
        if age_minutes < settings.twitter_cache_ttl_minutes:
            return _convert_decimals(item.get("data")), True

    return _convert_decimals(item.get("data")), False


def _set_cache(username: str, data: dict):
    table = _get_tweets_table()
    now = datetime.now(timezone.utc).isoformat()
    table.put_item(Item={
        "cache_key": _cache_key_for(username),
        "data": _convert_for_dynamo(data),
        "cached_at": now,
    })


def _resolve_user_id(username: str) -> str:
    table = _get_tweets_table()
    try:
        resp = table.get_item(Key={"cache_key": _user_cache_key(username)})
        item = resp.get("Item")
        if item and item.get("user_id"):
            return item["user_id"]
    except Exception:
        pass

    resp = requests.get(
        f"{TWITTER_API_BASE}/users/by/username/{username}",
        headers=_headers(),
        params={"user.fields": "id,name,username,profile_image_url,public_metrics,description"},
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Failed to resolve Twitter user: {resp.text}")

    user_data = resp.json().get("data")
    if not user_data:
        raise HTTPException(status_code=404, detail=f"Twitter user @{username} not found")

    user_id = user_data["id"]
    table.put_item(Item={
        "cache_key": _user_cache_key(username),
        "user_id": user_id,
        "username": user_data.get("username", username),
        "name": user_data.get("name", ""),
        "profile_image_url": user_data.get("profile_image_url", ""),
        "description": user_data.get("description", ""),
        "public_metrics": _convert_for_dynamo(user_data.get("public_metrics", {})),
    })
    return user_id


def _get_cached_profile(username: str) -> dict | None:
    table = _get_tweets_table()
    try:
        resp = table.get_item(Key={"cache_key": _user_cache_key(username)})
        item = resp.get("Item")
        if item:
            return _convert_decimals(item)
    except Exception:
        pass
    return None


def _fetch_from_twitter(username: str) -> dict:
    if not settings.twitter_bearer_token:
        raise HTTPException(status_code=503, detail="Twitter API not configured")

    user_id = _resolve_user_id(username)

    params: dict = {
        "max_results": 100,
        "tweet.fields": "author_id,created_at,entities,public_metrics,referenced_tweets,text",
        "expansions": "author_id,attachments.media_keys,referenced_tweets.id",
        "user.fields": "name,username,profile_image_url,verified,description",
        "media.fields": "preview_image_url,type,url,width,height",
    }

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

    data = resp.json()
    _set_cache(username, data)
    return data


@router.get("/mentions/{username}")
def get_mentions(username: str):
    """
    Fetch posts mentioning a Twitter user.
    Serves from DynamoDB cache, only calls Twitter API if cache is older than 15 minutes.
    """
    cached_data, is_fresh = _get_cache(username)

    if is_fresh and cached_data:
        return cached_data

    try:
        return _fetch_from_twitter(username)
    except HTTPException:
        if cached_data:
            return cached_data
        raise


@router.get("/profile/{username}")
def get_profile(username: str):
    """Get cached profile info for a Twitter user."""
    profile = _get_cached_profile(username)
    if profile:
        return profile

    # Force a resolve to populate the cache
    if not settings.twitter_bearer_token:
        raise HTTPException(status_code=503, detail="Twitter API not configured")
    _resolve_user_id(username)
    profile = _get_cached_profile(username)
    if profile:
        return profile
    raise HTTPException(status_code=404, detail=f"Could not fetch profile for @{username}")


@router.post("/refresh/{username}")
def refresh_mentions(username: str, clerk_id: str = Query(default=None)):
    """Force refresh mentions from Twitter API. Rate limited to 4/minute per user."""
    from app import db

    remaining = REFRESH_RATE_LIMIT

    if clerk_id:
        user = db.get_user_by_clerk_id(clerk_id)
        if user:
            now = datetime.now(timezone.utc)
            window_start = now - timedelta(seconds=REFRESH_RATE_WINDOW_SECONDS)

            timestamps = user.get("refresh_timestamps") or []
            recent = [ts for ts in timestamps if datetime.fromisoformat(ts) > window_start]

            if len(recent) >= REFRESH_RATE_LIMIT:
                oldest = min(datetime.fromisoformat(ts) for ts in recent)
                reset_at = oldest + timedelta(seconds=REFRESH_RATE_WINDOW_SECONDS)
                raise HTTPException(
                    status_code=429,
                    detail={
                        "message": "Refresh rate limit exceeded. Try again shortly.",
                        "remaining": 0,
                        "reset_at": reset_at.isoformat(),
                    },
                )

            recent.append(now.isoformat())
            db.update_user(user["user_id"], {"refresh_timestamps": recent})
            remaining = REFRESH_RATE_LIMIT - len(recent)

    data = _fetch_from_twitter(username)
    return {
        "status": "refreshed",
        "result_count": data.get("meta", {}).get("result_count", 0),
        "rate_limit": {
            "remaining": remaining,
            "limit": REFRESH_RATE_LIMIT,
            "window_seconds": REFRESH_RATE_WINDOW_SECONDS,
        },
    }


@router.get("/dashboard/{username}")
def get_dashboard(username: str):
    """
    Single endpoint that returns all data needed for the dashboard:
    profile, mentions, and computed stats — all in one JSON response.
    """
    # Get profile
    profile = _get_cached_profile(username)
    if not profile:
        try:
            _resolve_user_id(username)
            profile = _get_cached_profile(username)
        except Exception:
            profile = None

    # Get mentions (from cache or Twitter)
    cached_data, is_fresh = _get_cache(username)
    mentions = None
    if is_fresh and cached_data:
        mentions = cached_data
    else:
        try:
            mentions = _fetch_from_twitter(username)
        except Exception:
            mentions = cached_data  # fall back to stale cache

    # Compute stats
    tweets = mentions.get("data", []) if mentions else []
    total_likes = sum(t.get("public_metrics", {}).get("like_count", 0) for t in tweets)
    total_reposts = sum(t.get("public_metrics", {}).get("retweet_count", 0) for t in tweets)
    total_replies = sum(t.get("public_metrics", {}).get("reply_count", 0) for t in tweets)
    total_impressions = sum(t.get("public_metrics", {}).get("impression_count", 0) for t in tweets)

    return {
        "profile": profile,
        "mentions": mentions,
        "stats": {
            "mention_count": len(tweets),
            "total_likes": total_likes,
            "total_reposts": total_reposts,
            "total_replies": total_replies,
            "total_impressions": total_impressions,
        },
    }
