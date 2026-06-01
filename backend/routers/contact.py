from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

try:
    from backend import utils
except ImportError:
    import utils

router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: str
    message: str


@router.post("/contact")
def submit_contact(data: ContactRequest):
    print("New Contact Request")
    print(data)
    store = utils.load_data()
    contacts = store.get("contacts", [])
    entry = {
        "id": datetime.utcnow().isoformat() + "-" + str(len(contacts) + 1),
        "name": data.name,
        "email": data.email,
        "message": data.message,
        "received_at": datetime.utcnow().isoformat()
    }
    contacts.append(entry)
    store["contacts"] = contacts
    utils.save_data(store)

    return {
        "success": True,
        "message": "Message received successfully"
    }