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


def load_data() -> Dict[str, Any]:
    if not os.path.exists(DATA_PATH):
        return {}
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


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
