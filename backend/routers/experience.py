from fastapi import APIRouter

router = APIRouter()

@router.get("/experience")
def get_experience():
    return [
        {
            "company": "Apollo Supply Chain",
            "role": "Product Manager",
            "duration": "2022 - Present",
            "description": "Leading WMS, TMS and supply chain digitization initiatives."
        },
        {
            "company": "Previous Company",
            "role": "Business Analyst",
            "duration": "2020 - 2022",
            "description": "Worked on process automation and enterprise systems."
        }
    ]