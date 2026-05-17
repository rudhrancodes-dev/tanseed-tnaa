"""Tests for the /eligibility and /health endpoints."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def _post(payload):
    return client.post("/eligibility", json=payload)


def base_payload(**overrides):
    data = {
        "company_name": "TechStartup",
        "sector": "Agritech",
        "revenue": 50.0,
        "employees": 5,
        "description": "An AI-driven platform for crop disease detection.",
    }
    data.update(overrides)
    return data


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_eligible_startup():
    r = _post(base_payload())
    assert r.status_code == 200
    body = r.json()
    assert body["eligible"] is True
    assert isinstance(body["reasons"], list)
    assert isinstance(body["matching_schemes"], list)
    assert "TANSEED 3.0" in body["matching_schemes"]


def test_agri_sector_extra_scheme():
    r = _post(base_payload(sector="Agritech", revenue=50, employees=3))
    body = r.json()
    assert body["eligible"] is True
    assert "TANSEED Agri" in body["matching_schemes"]


def test_high_revenue_not_eligible():
    r = _post(base_payload(revenue=9999))
    body = r.json()
    assert body["eligible"] is False
    assert any("5000" in reason or "ceiling" in reason.lower() for reason in body["reasons"])


def test_short_description_not_eligible():
    r = _post(base_payload(description="Short"))
    body = r.json()
    assert body["eligible"] is False


def test_response_schema_fields():
    r = _post(base_payload())
    body = r.json()
    assert "eligible" in body
    assert "reasons" in body
    assert "matching_schemes" in body


def test_missing_field_returns_422():
    r = client.post("/eligibility", json={"company_name": "Test"})
    assert r.status_code == 422
