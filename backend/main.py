"""TANAAI FastAPI backend — /health, /eligibility, /ingest endpoints."""

import sys
import os

# Make tanseed_rag importable from the repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

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
        "name": "ingest",
        "description": (
            "Trigger re-ingestion of the TANSEED guidelines document into the "
            "RAG vector store. Restricted to backend operators."
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


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class EligibilityRequest(BaseModel):
    company_name: str = Field(
        ...,
        description="Legal name of the startup or company.",
        examples=["FarmAI Technologies Pvt Ltd"],
    )
    registration_type: str = Field(
        ...,
        description="Legal registration type: 'Private Limited', 'LLP', or 'Partnership'.",
        examples=["Private Limited"],
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
    location: str = Field(
        ...,
        description="State/city of registration. Must be in Tamil Nadu to qualify.",
        examples=["Chennai, Tamil Nadu"],
    )
    indian_ownership_pct: float = Field(
        ...,
        ge=0,
        le=100,
        description="Percentage of equity held by Indian promoters (must be ≥ 51%).",
        examples=[75.0],
    )
    avg_profit_3yr_lakhs: float = Field(
        default=0.0,
        ge=0,
        description="Average net profit over the last 3 years in INR lakhs (must be < 5 to qualify).",
        examples=[1.5],
    )
    tansim_registration: bool = Field(
        ...,
        description="Whether the startup is registered with TANSIM.",
        examples=[True],
    )
    dpiit_recognition: bool = Field(
        ...,
        description="Whether the startup has DPIIT/Startup India recognition.",
        examples=[True],
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
                    "registration_type": "Private Limited",
                    "sector": "Agritech",
                    "location": "Chennai, Tamil Nadu",
                    "indian_ownership_pct": 75.0,
                    "avg_profit_3yr_lakhs": 1.5,
                    "tansim_registration": True,
                    "dpiit_recognition": True,
                    "description": "An AI platform for real-time crop disease detection using satellite imagery.",
                }
            ]
        }
    }


class CheckResult(BaseModel):
    status: str = Field(..., description="'PASS' or 'FAIL'")
    value: Any = Field(..., description="The submitted value for this criterion")
    justification: str = Field(..., description="Explanation, optionally grounded in guidelines")


class EligibilityResponse(BaseModel):
    eligible: bool = Field(
        ...,
        description="True if the startup meets all TANSEED eligibility criteria.",
    )
    overall_status: str = Field(
        ...,
        description="'PASS' or 'FAIL'",
    )
    checks: Dict[str, CheckResult] = Field(
        ...,
        description="Per-criterion check results.",
    )
    recommendation: str = Field(
        ...,
        description="Human-readable overall recommendation.",
    )
    rag_grounded: bool = Field(
        ...,
        description="True when results were grounded via ChromaDB vector search.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "eligible": True,
                    "overall_status": "PASS",
                    "checks": {
                        "registration_type": {"status": "PASS", "value": "private limited", "justification": "Must be Private Limited, LLP, or Partnership Firm."},
                        "location": {"status": "PASS", "value": "chennai, tamil nadu", "justification": "Must be registered in Tamil Nadu."},
                    },
                    "recommendation": "The startup appears to be eligible for the TANSEED grant.",
                    "rag_grounded": True,
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

def _rule_based_check(req: EligibilityRequest) -> EligibilityResponse:
    checks: Dict[str, CheckResult] = {}

    reg = req.registration_type.strip().lower()
    reg_pass = any(t in reg for t in ["private limited", "llp", "partnership"])
    checks["registration_type"] = CheckResult(
        status="PASS" if reg_pass else "FAIL",
        value=reg,
        justification="Must be Private Limited, LLP, or Partnership Firm.",
    )

    loc = req.location.strip().lower()
    loc_pass = "tamil nadu" in loc or " tn" in loc
    checks["location"] = CheckResult(
        status="PASS" if loc_pass else "FAIL",
        value=loc,
        justification="Must be registered in Tamil Nadu.",
    )

    own_pass = req.indian_ownership_pct >= 51
    checks["indian_ownership_pct"] = CheckResult(
        status="PASS" if own_pass else "FAIL",
        value=req.indian_ownership_pct,
        justification=f"Must be ≥ 51% Indian-owned. Provided: {req.indian_ownership_pct}%",
    )

    profit_pass = req.avg_profit_3yr_lakhs < 5
    checks["avg_profit_3yr_lakhs"] = CheckResult(
        status="PASS" if profit_pass else "FAIL",
        value=req.avg_profit_3yr_lakhs,
        justification=f"Average 3-yr profit must be < ₹5L. Provided: {req.avg_profit_3yr_lakhs}L",
    )

    rec_pass = req.tansim_registration and req.dpiit_recognition
    checks["recognition"] = CheckResult(
        status="PASS" if rec_pass else "FAIL",
        value=f"TANSIM={req.tansim_registration}, DPIIT={req.dpiit_recognition}",
        justification="Must hold both TANSIM and DPIIT recognition.",
    )

    eligible = all(c.status == "PASS" for c in checks.values())
    recommendation = (
        "The startup appears to be eligible for the TANSEED grant. Proceed to application."
        if eligible
        else "The startup does not meet one or more eligibility criteria. Address the failing items before applying."
    )

    return EligibilityResponse(
        eligible=eligible,
        overall_status="PASS" if eligible else "FAIL",
        checks=checks,
        recommendation=recommendation,
        rag_grounded=False,
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
        "registration_type": req.registration_type,
        "sector": req.sector,
        "location": req.location,
        "indian_ownership_pct": req.indian_ownership_pct,
        "avg_profit_3yr_lakhs": req.avg_profit_3yr_lakhs,
        "tansim_registration": req.tansim_registration,
        "dpiit_recognition": req.dpiit_recognition,
    }

    report = _checker.check_eligibility(user_data)

    checks = {
        k: CheckResult(
            status=v["status"],
            value=v["value"],
            justification=v["justification"],
        )
        for k, v in report["checks"].items()
    }

    eligible = report["overall_status"] == "PASS"
    return EligibilityResponse(
        eligible=eligible,
        overall_status=report["overall_status"],
        checks=checks,
        recommendation=report["recommendation"],
        rag_grounded=True,
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
