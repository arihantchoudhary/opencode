import base64
import time
from datetime import datetime, timezone

import jwt
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import db
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
    raw = settings.github_app_private_key
    if not raw.startswith("-----"):
        # Try base64 decoding
        try:
            raw = base64.b64decode(raw).decode()
        except Exception:
            pass
    # Handle escaped newlines from env vars
    private_key = raw.replace("\\n", "\n").replace("\\r", "")
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


class CreateRepoRequest(BaseModel):
    name: str
    description: str = ""
    tweet_text: str = ""
    tweet_id: str = ""
    tweet_author: str = ""
    tweet_url: str = ""
    clerk_id: str = ""


@router.post("/create-repo")
def create_repo(body: CreateRepoRequest):
    """Create a new GitHub repository via the Stardrop GitHub App."""
    if not settings.github_app_id or not settings.github_app_private_key:
        raise HTTPException(status_code=500, detail="GitHub App credentials not configured")

    try:
        installation_tokens = _get_installation_tokens()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get installation tokens: {e}")

    if not installation_tokens:
        raise HTTPException(status_code=500, detail="No GitHub App installations found")

    inst = installation_tokens[0]
    headers = {
        "Authorization": f"token {inst['token']}",
        "Accept": "application/vnd.github+json",
    }

    account_type = inst["account"].get("type", "User")
    account_login = inst["account"]["login"]

    if account_type == "Organization":
        url = f"{GITHUB_API}/orgs/{account_login}/repos"
    else:
        url = f"{GITHUB_API}/user/repos"

    resp = requests.post(
        url,
        headers=headers,
        json={
            "name": body.name,
            "description": body.description,
            "private": False,
            "auto_init": True,
        },
    )

    if resp.status_code not in (200, 201):
        err = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
        detail = err.get("message", f"GitHub API error {resp.status_code}")
        raise HTTPException(status_code=resp.status_code, detail=detail)

    repo = resp.json()
    repo_full_name = repo["full_name"]

    # Populate README.md with tweet content
    if body.tweet_text:
        readme_resp = requests.get(
            f"{GITHUB_API}/repos/{repo_full_name}/contents/README.md",
            headers=headers,
        )
        if readme_resp.status_code == 200:
            readme_sha = readme_resp.json()["sha"]
            readme_content = f"# {body.name}\n\n"
            readme_content += f"> {body.tweet_text}\n\n"
            if body.tweet_author:
                readme_content += f"-- @{body.tweet_author}"
            if body.tweet_url:
                readme_content += f" ([source]({body.tweet_url}))"
            readme_content += "\n"

            encoded = base64.b64encode(readme_content.encode()).decode()
            requests.put(
                f"{GITHUB_API}/repos/{repo_full_name}/contents/README.md",
                headers=headers,
                json={
                    "message": "Initialize README with tweet content",
                    "content": encoded,
                    "sha": readme_sha,
                },
            )

    # Save project to user record
    if body.clerk_id:
        user = db.get_user_by_clerk_id(body.clerk_id)
        if user:
            project = {
                "repo_url": repo["html_url"],
                "repo_name": repo["name"],
                "full_name": repo_full_name,
                "tweet_id": body.tweet_id,
                "tweet_text": body.tweet_text[:280],
                "tweet_author": body.tweet_author,
                "tweet_url": body.tweet_url,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            db.append_project(user["user_id"], project)

    return {
        "html_url": repo["html_url"],
        "full_name": repo["full_name"],
        "name": repo["name"],
    }
