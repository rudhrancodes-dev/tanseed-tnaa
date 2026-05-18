from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any
from tanseed_rag.pipeline import TanseedPipeline
from tanseed_rag.eligibility import EligibilityChecker

app = FastAPI()
pipeline = TanseedPipeline()
checker = EligibilityChecker(pipeline)

class StartupData(BaseModel):
    name: str
    registration_type: str
    location: str
    indian_ownership_pct: float
    avg_profit_3yr_lakhs: float
    tansim_registration: bool
    dpiit_recognition: bool

@app.post("/api/check")
def check_eligibility(data: StartupData):
    return checker.check_eligibility(data.model_dump())

class DraftData(BaseModel):
    startup_data: StartupData
    project_description: str

@app.post("/api/draft")
def draft_application(data: DraftData):
    return checker.draft_application(data.startup_data.model_dump(), data.project_description)
