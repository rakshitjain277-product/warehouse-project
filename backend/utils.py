import json
import os
from datetime import datetime, timedelta

from typing import Any, Dict, Optional

try:
    from backend import database
except ImportError:
    import database

try:
    import jwt
except Exception:
    jwt = None

DATA_PATH = os.path.join(os.path.dirname(__file__), "data.json")

DEFAULT_THEME = {
    "backgroundColor": "#000000",
    "sectionColor": "#09090b",
    "surfaceColor": "#18181b",
    "textColor": "#ffffff",
    "mutedTextColor": "#a1a1aa",
    "accentColor": "#ffffff",
    "fontFamily": "Inter, Arial, sans-serif",
    "buttonRadius": "12",
}

DEFAULT_EXPERIENCE = [
    {
        "company": "Your Company",
        "role": "Software Engineer",
        "duration": "2024 - Present",
        "description": "Building scalable applications using React, Python and cloud technologies.",
        "id": "5f8ed95b8c4240208c64c6e6405e4016",
    },
    {
        "company": "Freelance / Personal Projects",
        "role": "Full Stack Developer",
        "duration": "2023 - 2024",
        "description": "Worked on automation systems, AI integrations and AWS deployments.",
        "id": "2d016919a3eb44f79c6585b334e4c7ac",
    },
    {
        "company": "Learning & Building",
        "role": "Self Driven Developer",
        "duration": "2022 - 2023",
        "description": "Explored frontend, backend, databases, APIs and modern web architecture.",
        "id": "7c07806f0d3641a8a54edfa702fd7ff0",
    },
]


def normalize_data(data: Dict[str, Any]) -> Dict[str, Any]:
    data.setdefault("profile", {})
    data["profile"].setdefault("image", "/profile.jpg")
    data["profile"].setdefault("coverImage", "")
    data["profile"].setdefault("resume", "/resume.pdf")
    data.setdefault("projects", [])
    if not data.get("experience"):
        data["experience"] = DEFAULT_EXPERIENCE.copy()
    data["theme"] = {**DEFAULT_THEME, **data.get("theme", {})}
    data.setdefault("skills", data.get("profile", {}).get("skills", []))
    data.setdefault("contacts", [])
    return data


def load_data() -> Dict[str, Any]:
    if not os.path.exists(DATA_PATH):
        return normalize_data({})
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return normalize_data(json.load(f))


def save_data(data: Dict[str, Any]) -> None:
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if jwt is None:
        raise RuntimeError("PyJWT is required for token generation. Install pyjwt.")
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=database.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, database.SECRET_KEY, algorithm=database.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    if jwt is None:
        raise RuntimeError("PyJWT is required for token verification. Install pyjwt.")
    try:
        payload = jwt.decode(token, database.SECRET_KEY, algorithms=[database.ALGORITHM])
        return payload
    except Exception as e:
        raise
