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

@router.get("/experience")
def get_experience():
    return utils.load_data().get("experience", [])
