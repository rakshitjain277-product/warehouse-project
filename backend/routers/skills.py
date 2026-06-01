from fastapi import APIRouter

try:
    from backend import utils
except ImportError:
    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        import utils
    except ImportError:
        import utils

router = APIRouter()

@router.get("/skills")
def get_skills():
    data = utils.load_data()
    return data.get("profile", {}).get("skills") or data.get("skills", [])
