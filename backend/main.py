"""TANAAI FastAPI backend — /eligibility endpoint."""

from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(title="TANAAI Eligibility API", version="0.1.0")


class EligibilityRequest(BaseModel):
    company_name: str = Field(..., description="Name of the startup/company")
    sector: str = Field(..., description="Industry sector (e.g. Agritech, Healthtech, Fintech)")
    revenue: float = Field(..., description="Annual revenue in INR lakhs")
    employees: int = Field(..., description="Number of employees")
    description: str = Field(..., description="Brief description of the company and its innovation")


class EligibilityResponse(BaseModel):
    eligible: bool
    reasons: List[str]
    matching_schemes: List[str]


TANSEED_SECTORS = [
    "agritech", "healthtech", "fintech", "edtech", "cleantech", "biotech",
    "manufacturing", "software", "ai", "iot", "logistics", "foodtech",
]

SCHEMES = {
    "TANSEED 3.0": "Core TANSEED grant for innovative startups up to 5 years old",
    "TANSEED Special": "For startups with strong social/rural impact",
    "TANSEED Agri": "Dedicated scheme for agritech and food-processing startups",
}


def _check_eligibility(req: EligibilityRequest) -> EligibilityResponse:
    reasons: List[str] = []
    matching_schemes: List[str] = []

    sector_lower = req.sector.strip().lower()
    is_known_sector = any(s in sector_lower for s in TANSEED_SECTORS)

    # Revenue check — TANSEED targets early-stage startups (≤ 50 Cr = 5000 lakhs)
    revenue_ok = req.revenue <= 5000
    if not revenue_ok:
        reasons.append(f"Revenue {req.revenue} L exceeds the TANSEED ceiling of 5000 L (₹50 Cr).")

    # Minimum viable team
    team_ok = req.employees >= 1
    if not team_ok:
        reasons.append("Company must have at least one employee.")

    # Description quality check
    desc_ok = len(req.description.strip()) >= 20
    if not desc_ok:
        reasons.append("Description is too short; provide a meaningful innovation summary.")

    # Sector alignment
    if not is_known_sector:
        reasons.append(
            f"Sector '{req.sector}' is not in the standard TANSEED sector list; "
            "manual review may be required."
        )

    eligible = revenue_ok and team_ok and desc_ok

    if eligible:
        matching_schemes.append("TANSEED 3.0")
        if "agri" in sector_lower or "food" in sector_lower:
            matching_schemes.append("TANSEED Agri")
        if req.employees <= 10 and req.revenue < 100:
            matching_schemes.append("TANSEED Special")
        if not reasons:
            reasons.append("Startup meets basic TANSEED eligibility criteria.")

    return EligibilityResponse(
        eligible=eligible,
        reasons=reasons,
        matching_schemes=matching_schemes,
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/eligibility", response_model=EligibilityResponse)
def check_eligibility(req: EligibilityRequest):
    return _check_eligibility(req)
