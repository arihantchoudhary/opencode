import uuid
from datetime import datetime, timezone

import boto3

from app.config import settings


def _get_table():
    dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
    return dynamodb.Table(settings.dynamodb_table_name)


def create_user(data: dict) -> dict:
    table = _get_table()
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "user_id": str(uuid.uuid4()),
        "created_at": now,
        "updated_at": now,
        **data,
    }
    table.put_item(Item=item)
    return item


def get_user(user_id: str) -> dict | None:
    table = _get_table()
    response = table.get_item(Key={"user_id": user_id})
    return response.get("Item")


def get_user_by_email(email: str) -> dict | None:
    table = _get_table()
    response = table.query(
        IndexName="email-index",
        KeyConditionExpression="email = :email",
        ExpressionAttributeValues={":email": email},
    )
    items = response.get("Items", [])
    return items[0] if items else None


def update_user(user_id: str, data: dict) -> dict | None:
    table = _get_table()
    existing = get_user(user_id)
    if not existing:
        return None

    now = datetime.now(timezone.utc).isoformat()
    updates = {k: v for k, v in data.items() if v is not None}
    updates["updated_at"] = now

    expression_parts = []
    values = {}
    names = {}
    for i, (key, val) in enumerate(updates.items()):
        expression_parts.append(f"#{key} = :val{i}")
        values[f":val{i}"] = val
        names[f"#{key}"] = key

    table.update_item(
        Key={"user_id": user_id},
        UpdateExpression="SET " + ", ".join(expression_parts),
        ExpressionAttributeValues=values,
        ExpressionAttributeNames=names,
    )
    return {**existing, **updates}


def delete_user(user_id: str) -> bool:
    table = _get_table()
    existing = get_user(user_id)
    if not existing:
        return False
    table.delete_item(Key={"user_id": user_id})
    return True


def list_users(limit: int = 50) -> list[dict]:
    table = _get_table()
    response = table.scan(Limit=limit)
    return response.get("Items", [])


# --- Sessions ---

def _get_sessions_table():
    dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
    return dynamodb.Table(settings.dynamodb_sessions_table_name)


def upsert_session(data: dict) -> dict:
    table = _get_sessions_table()
    now = datetime.now(timezone.utc).isoformat()
    existing = get_session(data["session_id"])
    if existing:
        updates = {k: v for k, v in data.items() if v is not None and k != "session_id"}
        updates["updated_at"] = now
        expression_parts = []
        values = {}
        names = {}
        for i, (key, val) in enumerate(updates.items()):
            expression_parts.append(f"#{key} = :val{i}")
            values[f":val{i}"] = val
            names[f"#{key}"] = key
        table.update_item(
            Key={"session_id": data["session_id"]},
            UpdateExpression="SET " + ", ".join(expression_parts),
            ExpressionAttributeValues=values,
            ExpressionAttributeNames=names,
        )
        return {**existing, **updates}
    else:
        item = {"updated_at": now, **data}
        table.put_item(Item=item)
        return item


def get_session(session_id: str) -> dict | None:
    table = _get_sessions_table()
    response = table.get_item(Key={"session_id": session_id})
    return response.get("Item")


def list_sessions(limit: int = 100) -> list[dict]:
    table = _get_sessions_table()
    response = table.scan(Limit=limit)
    items = response.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items


def list_sessions_by_user(user_id: str) -> list[dict]:
    table = _get_sessions_table()
    response = table.query(
        IndexName="user-id-index",
        KeyConditionExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id},
    )
    items = response.get("Items", [])
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items
