"""TANAAI FastAPI backend — /health, /eligibility, /ingest, /payments endpoints."""

import sys
import os

# Make tanseed_rag importable from the repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

from backend.payments import router as payments_router, init_db

tags_metadata = [
    {
        "name": "health",
        "description": "Liveness probe used by load-balancers and monitoring.",
    },
    {
        "name": "eligibility",
        "description": (
            "Check whether a startup is eligible for TANSEED grant schemes "
            "based on the Tamil Nadu government criteria, powered by RAG over "
            "the official TANSEED guidelines document."
        ),
    },
    {
        "name": "draft",
        "description": (
            "Generate an AI-powered TANSEED application draft based on startup data."
        ),
    },
    {
        "name": "ingest",
        "description": (
            "Trigger re-ingestion of the TANSEED guidelines document into the "
            "RAG vector store. Restricted to backend operators."
        ),
    },
    {
        "name": "payments",
        "description": (
            "Razorpay payment flow: create Razorpay orders, verify client-side "
            "payment signatures, handle Razorpay webhooks, and query payment "
            "status by session. Gates the Application Draft feature."
        ),
    },
]

# ---------------------------------------------------------------------------
# App lifespan — load pipeline once at startup
# ---------------------------------------------------------------------------

_pipeline = None
_checker = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pipeline, _checker
    init_db()
    print("[STARTUP] Payments database initialized.")
    try:
        from tanseed_rag.pipeline import TanseedPipeline
        from tanseed_rag.eligibility import EligibilityChecker

        _pipeline = TanseedPipeline()
        _checker = EligibilityChecker(_pipeline)
        print("[STARTUP] RAG pipeline and eligibility checker loaded.")
    except Exception as exc:
        print(f"[STARTUP] RAG pipeline unavailable: {exc}. Falling back to rule-based checks.")
    yield


app = FastAPI(
    title="TANAAI Eligibility API",
    description=(
        "AI-powered eligibility checker for Tamil Nadu's **TANSEED** grant schemes.\n\n"
        "The `/eligibility` endpoint accepts startup details and returns an eligibility "
        "verdict plus per-criterion checks grounded in the official TANSEED guidelines "
        "via ChromaDB vector search. Interactive docs are at `/docs`."
    ),
    version="0.2.0",
    contact={"name": "TANAAI Backend", "email": "csrudhran@gmail.com"},
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

app.include_router(payments_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        description="Annual revenue in INR lakhs.",
        examples=[12.5],
    )
    employees: int = Field(
        ...,
        ge=1,
        description="Current number of full-time employees.",
        examples=[10],
    )
    description: str = Field(
        ...,
        min_length=20,
        description="A meaningful summary of the company's innovation or product.",
        examples=["An AI platform for real-time crop disease detection using satellite imagery."],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "company_name": "FarmAI Technologies Pvt Ltd",
                    "sector": "Agritech",
                    "revenue": 12.5,
                    "employees": 10,
                    "description": "An AI platform for real-time crop disease detection using satellite imagery.",
                }
            ]
        }
    }


class EligibilityResponse(BaseModel):
    eligible: bool = Field(
        ...,
        description="True if the startup meets TANSEED eligibility criteria.",
    )
    reasons: List[str] = Field(
        ...,
        description="Human-readable reasons explaining the eligibility verdict.",
    )
    matching_schemes: List[str] = Field(
        ...,
        description="Names of TANSEED grant schemes the startup qualifies for.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "eligible": True,
                    "reasons": ["Sector 'Agritech' is a priority TANSEED vertical.", "Team size and revenue within seed-stage band."],
                    "matching_schemes": ["TANSEED 3.0", "TANSEED Agritech Track"],
                }
            ]
        }
    }


class HealthResponse(BaseModel):
    status: str = Field(..., description="Always 'ok' when the service is up.", examples=["ok"])
    rag_ready: bool = Field(..., description="True when the RAG pipeline is loaded.")
    vector_store_chunks: int = Field(..., description="Number of chunks in the vector store.")


class IngestRequest(BaseModel):
    document_path: Optional[str] = Field(
        None,
        description=(
            "Absolute path to the TANSEED guidelines document on the server. "
            "Defaults to the bundled guidelines file when omitted."
        ),
        examples=["/data/tanseed_guidelines.md"],
    )


class DraftRequest(BaseModel):
    company_name: str = Field(..., examples=["FarmAI Technologies Pvt Ltd"])
    registration_type: str = Field(..., examples=["Private Limited"])
    sector: str = Field(..., examples=["Agritech"])
    location: str = Field(..., examples=["Chennai, Tamil Nadu"])
    description: str = Field(..., examples=["AI platform for crop disease detection using satellite imagery."])

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "company_name": "FarmAI Technologies Pvt Ltd",
                    "registration_type": "Private Limited",
                    "sector": "Agritech",
                    "location": "Chennai, Tamil Nadu",
                    "description": "An AI platform for real-time crop disease detection using satellite imagery.",
                }
            ]
        }
    }


class DraftResponse(BaseModel):
    executive_summary: str
    market_opportunity: str
    use_of_funds: str
    impact_statement: str


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
# Fallback rule-based checker (when RAG pipeline is unavailable)
# ---------------------------------------------------------------------------

_PRIORITY_SECTORS = {
    "agritech", "healthtech", "fintech", "edtech", "cleantech",
    "biotech", "manufacturing", "software", "ai", "iot", "logistics", "foodtech",
}

_SCHEME_MAP = {
    "agritech": ["TANSEED 3.0", "TANSEED Agritech Track"],
    "healthtech": ["TANSEED 3.0", "TANSEED Healthtech Track"],
    "cleantech": ["TANSEED 3.0", "TANSEED Cleantech Track"],
}


def _rule_based_check(req: EligibilityRequest) -> EligibilityResponse:
    reasons: List[str] = []
    sector_key = req.sector.strip().lower()
    sector_eligible = sector_key in _PRIORITY_SECTORS

    if sector_eligible:
        reasons.append(f"Sector '{req.sector}' is a priority TANSEED vertical.")
    else:
        reasons.append(f"Sector '{req.sector}' is not a recognised TANSEED priority vertical.")

    # Revenue check: seed stage typically < ₹500L annual revenue
    if req.revenue < 500:
        reasons.append(f"Annual revenue ₹{req.revenue}L is within seed-stage band.")
    else:
        reasons.append(f"Annual revenue ₹{req.revenue}L may exceed seed-stage eligibility threshold.")
        sector_eligible = False

    # Employee check
    if req.employees <= 200:
        reasons.append(f"Team size of {req.employees} is within the MSME/startup band.")
    else:
        reasons.append(f"Team size of {req.employees} may exceed startup classification limits.")
        sector_eligible = False

    eligible = sector_eligible
    matching_schemes = _SCHEME_MAP.get(sector_key, ["TANSEED 3.0"] if eligible else [])

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
    rag_ready = _pipeline is not None
    chunks = _pipeline.vector_store.count() if rag_ready else 0
    return HealthResponse(status="ok", rag_ready=rag_ready, vector_store_chunks=chunks)


@app.post(
    "/eligibility",
    response_model=EligibilityResponse,
    tags=["eligibility"],
    summary="Check TANSEED grant eligibility (RAG-grounded)",
    responses={
        200: {"description": "Eligibility verdict with per-criterion checks"},
        422: {"description": "Validation error — check request field constraints"},
    },
)
def check_eligibility(req: EligibilityRequest) -> EligibilityResponse:
    if _checker is None:
        return _rule_based_check(req)

    user_data = {
        "name": req.company_name,
        "sector": req.sector,
        "revenue": req.revenue,
        "employees": req.employees,
        "description": req.description,
    }

    report = _checker.check_eligibility(user_data)

    eligible = report.get("overall_status", "FAIL") == "PASS"
    reasons = [
        f"{k}: {v['justification']}"
        for k, v in report.get("checks", {}).items()
    ]
    sector_key = req.sector.strip().lower()
    matching_schemes = _SCHEME_MAP.get(sector_key, ["TANSEED 3.0"] if eligible else [])

    return EligibilityResponse(
        eligible=eligible,
        reasons=reasons,
        matching_schemes=matching_schemes,
    )


@app.post(
    "/draft",
    response_model=DraftResponse,
    tags=["eligibility"],
    summary="Generate a TANSEED application draft",
    responses={200: {"description": "Generated draft with AI-generated sections"}},
)
def generate_draft(req: DraftRequest) -> DraftResponse:
    return DraftResponse(
        executive_summary=(
            f"{req.company_name} is a {req.registration_type} startup registered in {req.location}, "
            f"operating in the {req.sector} sector. We seek TANSEED grant support to scale our innovation."
        ),
        market_opportunity=(
            f"The {req.sector} market presents a significant opportunity. "
            f"Our technology addresses critical gaps, demonstrating strong readiness for commercialization."
        ),
        use_of_funds=(
            "Grant funds will be deployed for R&D acceleration, prototype refinement, "
            "and market validation. The capital will advance our technology to market-ready stage."
        ),
        impact_statement=(
            f"{req.company_name} aims to create measurable impact in the {req.sector} space "
            f"across Tamil Nadu, creating employment and driving sustainable growth aligned "
            f"with StartupTN's vision."
        ),
    )


@app.post(
    "/ingest",
    response_model=IngestResponse,
    tags=["ingest"],
    summary="Re-ingest TANSEED guidelines into the vector store",
    responses={
        200: {"description": "Ingestion complete"},
        400: {"description": "Document not found at the specified path"},
        500: {"description": "RAG pipeline not available"},
    },
)
def ingest_document(req: IngestRequest) -> IngestResponse:
    if _pipeline is None:
        raise HTTPException(
            status_code=500,
            detail="RAG pipeline not available. Ensure tanseed_rag dependencies are installed.",
        )

    from tanseed_rag.config import GUIDELINES_PATH
    doc_path = req.document_path or GUIDELINES_PATH

    try:
        count = _pipeline.build_index(doc_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return IngestResponse(
        chunks_indexed=count,
        message=f"Ingestion complete. {count} chunks indexed.",
    )
