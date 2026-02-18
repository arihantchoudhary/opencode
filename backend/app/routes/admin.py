import time

import jwt
import requests
from fastapi import APIRouter, HTTPException

from app.config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

GITHUB_API = "https://api.github.com"


def _generate_jwt() -> str:
    """Generate a JWT signed with the GitHub App's private key."""
    now = int(time.time())
    payload = {
        "iat": now - 60,
        "exp": now + (10 * 60),
        "iss": settings.github_app_id,
    }
    private_key = settings.github_app_private_key.replace("\\n", "\n")
    return jwt.encode(payload, private_key, algorithm="RS256")


def _get_installation_tokens() -> list[dict]:
    """Get access tokens for all installations of the GitHub App."""
    token = _generate_jwt()
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }

    resp = requests.get(f"{GITHUB_API}/app/installations", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Failed to list installations")

    installations = resp.json()
    tokens = []
    for inst in installations:
        token_resp = requests.post(
            f"{GITHUB_API}/app/installations/{inst['id']}/access_tokens",
            headers=headers,
        )
        if token_resp.status_code == 201:
            tokens.append({
                "token": token_resp.json()["token"],
                "account": inst["account"],
            })

    return tokens


@router.get("/repos")
def list_connected_repos():
    if not settings.github_app_id or not settings.github_app_private_key:
        raise HTTPException(status_code=500, detail="GitHub App credentials not configured")

    installation_tokens = _get_installation_tokens()

    all_repos = []
    for inst in installation_tokens:
        headers = {
            "Authorization": f"token {inst['token']}",
            "Accept": "application/vnd.github+json",
        }

        page = 1
        while True:
            resp = requests.get(
                f"{GITHUB_API}/installation/repositories",
                headers=headers,
                params={"per_page": 100, "page": page},
            )
            if resp.status_code != 200:
                break

            data = resp.json()
            for repo in data.get("repositories", []):
                all_repos.append({
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "html_url": repo["html_url"],
                    "description": repo.get("description"),
                    "private": repo["private"],
                    "updated_at": repo["updated_at"],
                    "owner": {
                        "login": repo["owner"]["login"],
                        "avatar_url": repo["owner"]["avatar_url"],
                    },
                    "permissions": repo.get("permissions", {}),
                })

            if len(data.get("repositories", [])) < 100:
                break
            page += 1

    all_repos.sort(key=lambda r: r["updated_at"], reverse=True)
    return all_repos
