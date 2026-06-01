from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.profile import router as profile_router
from routers.projects import router as projects_router
from routers.contact import router as contact_router
from routers.experience import router as experience_router
from routers.skills import router as skills_router
from routers.admin import router as admin_router

app = FastAPI(title="Rakshit Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile_router)
app.include_router(projects_router)
app.include_router(contact_router)
app.include_router(experience_router)
app.include_router(skills_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "Portfolio API Running"}