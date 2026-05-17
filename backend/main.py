"""TANAAI FastAPI backend — /health, /eligibility, /ingest endpoints."""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional

tags_metadata = [
    {
        "name": "health",
        "description": "Liveness probe used by load-balancers and monitoring.",
    },
    {
        "name": "eligibility",
        "description": (
            "Check whether a startup is eligible for TANSEED grant schemes "
            "based on the Tamil Nadu government criteria."
        ),
    },
    {
        "name": "ingest",
        "description": (
            "Trigger re-ingestion of the TANSEED guidelines document into the "
            "RAG vector store. Restricted to backend operators."
        ),
    },
]

app = FastAPI(
    title="TANAAI Eligibility API",
    description=(
        "AI-powered eligibility checker for Tamil Nadu's **TANSEED** grant schemes.\n\n"
        "The `/eligibility` endpoint accepts startup details and returns an eligibility "
        "verdict plus the list of matching TANSEED schemes. Interactive docs are at `/docs`."
    ),
    version="0.1.0",
    contact={"name": "TANAAI Backend", "email": "csrudhran@gmail.com"},
    openapi_tags=tags_metadata,
)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class EligibilityRequest(BaseModel):
    company_name: str = Field(
        ...,
        description="Legal name of the startup or company.",
        examples=["FarmAI Technologies Pvt Ltd"],
    )
    sector: str = Field(
        ...,
        description=(
            "Industry sector. Well-known TANSEED sectors: Agritech, Healthtech, "
            "Fintech, Edtech, Cleantech, Biotech, Manufacturing, Software, AI, "
            "IoT, Logistics, Foodtech."
        ),
        examples=["Agritech"],
    )
    revenue: float = Field(
        ...,
        ge=0,
        description="Annual revenue in INR lakhs. Must be ≤ 5000 (₹50 Cr) to qualify.",
        examples=[80.0],
    )
    employees: int = Field(
        ...,
        ge=1,
        description="Total number of full-time employees (must be ≥ 1).",
        examples=[6],
    )
    description: str = Field(
        ...,
        min_length=20,
        description=(
            "A meaningful summary of the company's innovation or product "
            "(minimum 20 characters)."
        ),
        examples=["An AI platform for real-time crop disease detection using satellite imagery."],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "company_name": "FarmAI Technologies Pvt Ltd",
                    "sector": "Agritech",
                    "revenue": 80.0,
                    "employees": 6,
                    "description": "An AI platform for real-time crop disease detection using satellite imagery.",
                }
            ]
        }
    }


class EligibilityResponse(BaseModel):
    eligible: bool = Field(
        ...,
        description="True if the startup meets all basic TANSEED eligibility criteria.",
    )
    reasons: List[str] = Field(
        ...,
        description=(
            "Human-readable explanations for each pass or fail condition. "
            "Always contains at least one item."
        ),
    )
    matching_schemes: List[str] = Field(
        ...,
        description=(
            "List of TANSEED scheme names the startup qualifies for "
            "(empty if not eligible)."
        ),
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "eligible": True,
                    "reasons": ["Startup meets basic TANSEED eligibility criteria."],
                    "matching_schemes": ["TANSEED 3.0", "TANSEED Agri", "TANSEED Special"],
                }
            ]
        }
    }


class HealthResponse(BaseModel):
    status: str = Field(..., description="Always 'ok' when the service is up.", examples=["ok"])


class IngestRequest(BaseModel):
    document_path: Optional[str] = Field(
        None,
        description=(
            "Absolute path to the TANSEED guidelines document on the server. "
            "Defaults to the bundled guidelines file when omitted."
        ),
        examples=["/data/tanseed_guidelines.txt"],
    )


class IngestResponse(BaseModel):
    chunks_indexed: int = Field(
        ...,
        description="Number of text chunks successfully embedded and stored in the vector database.",
        examples=[42],
    )
    message: str = Field(
        ...,
        description="Human-readable status message.",
        examples=["Ingestion complete. 42 chunks indexed."],
    )


# ---------------------------------------------------------------------------
# Eligibility logic
# ---------------------------------------------------------------------------

TANSEED_SECTORS = [
    "agritech", "healthtech", "fintech", "edtech", "cleantech", "biotech",
    "manufacturing", "software", "ai", "iot", "logistics", "foodtech",
]


def _check_eligibility(req: EligibilityRequest) -> EligibilityResponse:
    reasons: List[str] = []
    matching_schemes: List[str] = []

    sector_lower = req.sector.strip().lower()
    is_known_sector = any(s in sector_lower for s in TANSEED_SECTORS)

    revenue_ok = req.revenue <= 5000
    if not revenue_ok:
        reasons.append(f"Revenue {req.revenue} L exceeds the TANSEED ceiling of 5000 L (₹50 Cr).")

    team_ok = req.employees >= 1
    if not team_ok:
        reasons.append("Company must have at least one employee.")

    desc_ok = len(req.description.strip()) >= 20
    if not desc_ok:
        reasons.append("Description is too short; provide a meaningful innovation summary.")

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


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["health"],
    summary="Liveness probe",
    responses={200: {"description": "Service is healthy"}},
)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post(
    "/eligibility",
    response_model=EligibilityResponse,
    tags=["eligibility"],
    summary="Check TANSEED grant eligibility",
    responses={
        200: {"description": "Eligibility verdict and matching schemes"},
        422: {"description": "Validation error — check request field constraints"},
    },
)
def check_eligibility(req: EligibilityRequest) -> EligibilityResponse:
    return _check_eligibility(req)


@app.post(
    "/ingest",
    response_model=IngestResponse,
    tags=["ingest"],
    summary="Re-ingest TANSEED guidelines into the vector store",
    responses={
        200: {"description": "Ingestion complete"},
        400: {"description": "Document not found at the specified path"},
    },
)
def ingest_document(req: IngestRequest) -> IngestResponse:
    """
    Triggers the RAG ingestion pipeline. In production this processes the
    TANSEED guidelines PDF/text, chunks it, embeds it, and stores it in
    the vector database. This endpoint is intended for backend operators
    after a guidelines update — not for end-user calls.
    """
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

    try:
        from tanseed_rag.pipeline import TanseedPipeline
        from tanseed_rag.config import GUIDELINES_PATH
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="RAG pipeline not available. Ensure tanseed_rag is installed.",
        )

    doc_path = req.document_path or GUIDELINES_PATH

    try:
        pipeline = TanseedPipeline()
        count = pipeline.build_index(doc_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return IngestResponse(
        chunks_indexed=count,
        message=f"Ingestion complete. {count} chunks indexed.",
    )
