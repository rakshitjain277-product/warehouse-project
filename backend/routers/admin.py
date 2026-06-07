from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import timedelta

try:
    from backend import database
    from backend import utils
except ImportError:
    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        import database
        import utils
    except ImportError:
        import database
        import utils

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    company: Optional[str] = None
    tagline: Optional[str] = None
    image: Optional[str] = None
    resume: Optional[str] = None
    skills: Optional[list] = None


class Project(BaseModel):
    title: str
    description: str
    tech: list
    link: Optional[str]


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    description: str


def require_admin(token: Optional[str]):
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    try:
        payload = utils.verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if payload.get("sub") != database.ADMIN_USERNAME:
        raise HTTPException(status_code=403, detail="Not authorized")


@router.post("/admin/login")
def login(data: LoginRequest):
    if data.username != database.ADMIN_USERNAME or data.password != database.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = utils.create_access_token({"sub": database.ADMIN_USERNAME}, expires_delta=timedelta(minutes=database.ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/admin/data")
def get_all_data(authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    return utils.load_data()


@router.put("/admin/profile")
def update_profile(payload: ProfileUpdate, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    profile = data.get("profile", {})
    for k, v in payload.dict(exclude_unset=True).items():
        if k == "skills":
            data["skills"] = v
        profile[k] = v
    data["profile"] = profile
    utils.save_data(data)
    return {"success": True, "profile": profile}


@router.post("/admin/projects")
def add_project(project: Project, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    projects = data.get("projects", [])
    proj = project.dict()
    proj["id"] = uuid.uuid4().hex
    projects.append(proj)
    data["projects"] = projects
    utils.save_data(data)
    return {"success": True, "project": proj}


@router.put("/admin/projects/{project_id}")
def edit_project(project_id: str, project: Project, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    projects = data.get("projects", [])
    for p in projects:
        if p.get("id") == project_id:
            p.update(project.dict())
            utils.save_data(data)
            return {"success": True, "project": p}
    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/admin/projects/{project_id}")
def delete_project(project_id: str, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    projects = data.get("projects", [])
    new_projects = [p for p in projects if p.get("id") != project_id]
    if len(new_projects) == len(projects):
        raise HTTPException(status_code=404, detail="Project not found")
    data["projects"] = new_projects
    utils.save_data(data)
    return {"success": True}


@router.post("/admin/experience")
def add_experience(experience: Experience, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    entries = data.get("experience", [])
    entry = experience.dict()
    entry["id"] = uuid.uuid4().hex
    entries.append(entry)
    data["experience"] = entries
    utils.save_data(data)
    return {"success": True, "experience": entry}


@router.put("/admin/experience/{experience_id}")
def edit_experience(experience_id: str, experience: Experience, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    entries = data.get("experience", [])
    for entry in entries:
        if entry.get("id") == experience_id:
            entry.update(experience.dict())
            utils.save_data(data)
            return {"success": True, "experience": entry}
    raise HTTPException(status_code=404, detail="Experience not found")


@router.delete("/admin/experience/{experience_id}")
def delete_experience(experience_id: str, authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    entries = data.get("experience", [])
    new_entries = [entry for entry in entries if entry.get("id") != experience_id]
    if len(new_entries) == len(entries):
        raise HTTPException(status_code=404, detail="Experience not found")
    data["experience"] = new_entries
    utils.save_data(data)
    return {"success": True}


@router.get("/admin/contacts")
def list_contacts(authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    data = utils.load_data()
    return data.get("contacts", [])
