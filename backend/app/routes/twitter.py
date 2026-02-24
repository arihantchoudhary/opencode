import json
from datetime import datetime, timezone
from decimal import Decimal

import boto3
import requests
from fastapi import APIRouter, HTTPException, Query

from app.config import settings

router = APIRouter(prefix="/api/twitter", tags=["twitter"])

TWITTER_API_BASE = "https://api.twitter.com/2"
CACHE_KEY = "stardroplin_mentions"


def _headers():
    return {"Authorization": f"Bearer {settings.twitter_bearer_token}"}


def _get_tweets_table():
    dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
    return dynamodb.Table(settings.dynamodb_tweets_table_name)


def _convert_decimals(obj):
    """Convert Decimal types from DynamoDB back to int/float for JSON."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, dict):
        return {k: _convert_decimals(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_decimals(i) for i in obj]
    return obj


def _convert_for_dynamo(obj):
    """Convert floats/ints in nested dicts to Decimal for DynamoDB."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, int) and not isinstance(obj, bool):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _convert_for_dynamo(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_convert_for_dynamo(i) for i in obj]
    return obj


def _get_cache():
    """Read cached mentions from DynamoDB. Returns (data, is_fresh)."""
    table = _get_tweets_table()
    try:
        resp = table.get_item(Key={"cache_key": CACHE_KEY})
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


def _set_cache(data: dict):
    """Write mentions data to DynamoDB cache."""
    table = _get_tweets_table()
    now = datetime.now(timezone.utc).isoformat()
    table.put_item(Item={
        "cache_key": CACHE_KEY,
        "data": _convert_for_dynamo(data),
        "cached_at": now,
    })


def _resolve_user_id() -> str:
    """Look up @stardroplin user ID, with DynamoDB cache."""
    table = _get_tweets_table()
    try:
        resp = table.get_item(Key={"cache_key": "stardroplin_user_id"})
        item = resp.get("Item")
        if item and item.get("user_id"):
            return item["user_id"]
    except Exception:
        pass

    resp = requests.get(
        f"{TWITTER_API_BASE}/users/by/username/stardroplin",
        headers=_headers(),
        params={"user.fields": "id,name,username"},
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Failed to resolve Twitter user: {resp.text}")

    user_data = resp.json().get("data")
    if not user_data:
        raise HTTPException(status_code=404, detail="Twitter user @stardroplin not found")

    user_id = user_data["id"]
    table.put_item(Item={
        "cache_key": "stardroplin_user_id",
        "user_id": user_id,
        "username": user_data["username"],
        "name": user_data["name"],
    })
    return user_id


def _fetch_from_twitter() -> dict:
    """Fetch fresh mentions from Twitter API and cache them."""
    if not settings.twitter_bearer_token:
        raise HTTPException(status_code=503, detail="Twitter API not configured")

    user_id = _resolve_user_id()

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
    _set_cache(data)
    return data


@router.get("/mentions")
def get_mentions():
    """
    Fetch posts mentioning @stardroplin.
    Serves from DynamoDB cache, only calls Twitter API if cache is older than 15 minutes.
    """
    cached_data, is_fresh = _get_cache()

    if is_fresh and cached_data:
        return cached_data

    # Cache is stale or empty — try to refresh from Twitter
    try:
        return _fetch_from_twitter()
    except HTTPException:
        # If Twitter call fails but we have stale cache, serve it
        if cached_data:
            return cached_data
        raise


@router.post("/refresh")
def refresh_mentions():
    """Force refresh mentions from Twitter API (use sparingly)."""
    data = _fetch_from_twitter()
    return {"status": "refreshed", "result_count": data.get("meta", {}).get("result_count", 0)}
